import os
import sys
import json
import uuid

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.session import SessionLocal, engine
from app.database.base import Base
import app.models  # noqa: F401
from app.models.user import User
from app.services.eval.experiment_runner import experiment_runner
from app.services.eval.dataset_service import dataset_service
from app.services.embedding_service import embedding_service

def main():
    print("=== STARTING VAULTONAUT REAL EVALUATION RUN ===")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Find or create a benchmark user
        user = db.query(User).filter(User.email == "eval_benchmark_user@vaultonaut.local").first()
        if not user:
            user = User(
                id=uuid.uuid4(),
                google_id="eval_benchmark_google_id",
                email="eval_benchmark_user@vaultonaut.local",
                full_name="Evaluation Benchmark User",
                email_verified=True,
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        print(f"Benchmark User ID: {user.id}")

        # 1. Ensure benchmark corpus is indexed
        print("Ensuring benchmark corpus document is indexed in ChromaDB...")
        experiment_runner.ensure_benchmark_corpus_indexed(db, user.id, strategy="fixed_overlap")

        # 2. Run Main Evaluation Run
        print("Executing Full Benchmark Run (Top-K=5, Threshold=0.45)...")
        eval_run = experiment_runner.run_benchmark_evaluation(
            db=db,
            user_id=user.id,
            top_k=5,
            similarity_threshold=0.45,
            chunking_strategy="fixed_overlap",
            run_name="Golden Benchmark Baseline (Top-K=5, Th=0.45)",
            sample_limit=14  # Balanced representative run covering all 7 categories
        )
        print("Benchmark Evaluation Finished!")
        print("Metrics Summary:")
        print(json.dumps(eval_run["metrics"], indent=2))
        print("Latency Summary:")
        print(json.dumps(eval_run["latency"], indent=2))
        print("Failure Diagnostics:")
        print(json.dumps(eval_run["failure_diagnostics"]["failure_breakdown"], indent=2))

        # 3. Run Multi-Strategy Chunking Experiment
        print("\nExecuting Multi-Strategy Chunking Experiment (A vs B vs C)...")
        chunking_exp = experiment_runner.run_chunking_experiment(db, user.id)
        print("Chunking Comparison Matrix:")
        print(json.dumps(chunking_exp["comparison_matrix"], indent=2))

        # 4. Run Threshold Sensitivity Sweep
        print("\nExecuting Similarity Threshold Sweep [0.30, 0.45, 0.60, 0.75]...")
        th_exp = experiment_runner.run_threshold_sweep(db, user.id)
        print("Threshold Sweep Data:")
        print(json.dumps(th_exp["sweep_data"], indent=2))

        # 5. Embedding Cache Stats
        cache_stats = embedding_service.get_cache_stats()
        print("\nEmbedding Cache Stats:")
        print(json.dumps(cache_stats, indent=2))

        # Save all results to a JSON file for documentation
        results_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "real_evaluation_results.json")
        with open(results_file, "w", encoding="utf-8") as f:
            json.dump({
                "baseline_run": eval_run,
                "chunking_experiment": chunking_exp,
                "threshold_sweep": th_exp,
                "cache_stats": cache_stats
            }, f, indent=2)
        print(f"\nSaved all results to {results_file}")

    finally:
        db.close()

if __name__ == "__main__":
    main()
