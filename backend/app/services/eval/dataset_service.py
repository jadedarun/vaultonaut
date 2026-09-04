import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.evaluation import EvaluationDataset, EvaluationItem
from app.core.logging import logger

BENCHMARK_DOCUMENT_TITLE = "Distributed Systems & Cloud Architecture Guide.md"

BENCHMARK_DOCUMENT_CONTENT = """# Distributed Systems and Cloud Architecture Guide

## Section 1: Fundamentals of Distributed Systems
A distributed system is a collection of autonomous computing entities that communicate via networks to coordinate actions and share resources. The primary motivation for distributed computing is horizontal scalability, fault tolerance, and geographic distribution. Key architectural patterns include client-server, peer-to-peer, and event-driven architectures. 

The CAP theorem states that any distributed data store can simultaneously provide at most two out of three guarantees: Consistency, Availability, and Partition Tolerance. In practice, network partitions are inevitable in physical infrastructure, meaning system designers must balance consistency against availability during network disruptions.

## Section 2: Consistency Models and Consensus Algorithms
Strong consistency ensures that all read operations return the most recent write. In contrast, eventual consistency guarantees that, in the absence of new updates, all replicas will eventually converge to identical values. Systems like Amazon DynamoDB and Apache Cassandra prioritize high availability using eventual consistency and vector clocks.

Raft and Paxos are consensus algorithms that establish agreement across distributed nodes in the presence of failures. Raft decomposes consensus into leader election, log replication, and safety. A Raft cluster requires a quorum of nodes, defined mathematically as floor(N/2) + 1 nodes, to elect a leader and commit transactions. For a cluster of 5 nodes, a quorum of 3 nodes is strictly required to reach consensus.

## Section 3: Data Partitioning and Replication Strategies
Partitioning, also known as sharding, divides massive datasets across multiple storage nodes. Consistent hashing is an algorithm that minimizes key reorganization when nodes are added or removed from a cluster. It maps both nodes and data keys onto a virtual circular ring of 2^32 positions. When a node fails or is decommissioned, only K/N keys need to be remapped, where K is the total number of keys and N is the number of active servers.

Replication strategies are categorized into synchronous and asynchronous replication. Synchronous replication guarantees zero data loss (RPO = 0) because writes are confirmed only after being written to both primary and replica nodes. However, synchronous replication incurs a latency penalty equal to the round-trip network time to the slowest replica. Asynchronous replication provides higher write throughput and sub-millisecond local latency, but risks data loss during ungraceful primary node failure.

## Section 4: Fault Tolerance, Retries, and Circuit Breakers
Building resilient distributed services requires proactive fault mitigation patterns. The Circuit Breaker pattern prevents cascading failures by temporarily halting requests to an unhealthy downstream service. A circuit breaker has three discrete states: Closed (normal operation), Open (requests fail immediately without contacting the downstream dependency), and Half-Open (a limited number of probe requests are allowed to test dependency recovery).

Exponential backoff with jitter is an essential retry strategy for transient errors. When retrying failed network calls, adding randomized jitter prevents the 'thundering herd' problem, where hundreds of client instances simultaneously retry requests at synchronized intervals, overwhelming recovering backends.

## Section 5: Microservices vs Monolithic Architecture
Monolithic architectures package user interface, business logic, and database access into a single deployable artifact. Monoliths offer straightforward local debugging, zero network serialization latency between modules, and transactional ACID guarantees within a single relational database. However, as development teams grow past 50 engineers, monolithic codebases suffer from deployment bottlenecks, tight coupling, and high blast radius for bugs.

Microservices architecture decomposes applications into independently deployable, bounded-context services communicating over lightweight protocols such as gRPC or REST. Microservices enable independent autoscaling and polyglot technology stacks, but introduce substantial operational complexity, distributed tracing challenges, eventual consistency dilemmas, and network latency overhead.

## Section 6: Observability and Performance Metrics
Modern cloud observability is built upon three telemetry pillars: Metrics, Logs, and Distributed Tracing. Distributed tracing utilizes trace IDs and span IDs conforming to the OpenTelemetry standard to propagate request context across asynchronous service boundaries. Key performance indicators include P50, P95, and P99 latency percentiles. For mission-critical APIs, target P99 response latency is typically under 120 milliseconds, with 99.99% service availability (permitting under 4.38 minutes of downtime per month).
"""

BENCHMARK_ITEMS: List[Dict[str, Any]] = [
    # 1. Fact Retrieval (direct single-hop lookup)
    {
        "question": "What does the CAP theorem state regarding distributed data stores?",
        "ground_truth_answer": "The CAP theorem states that any distributed data store can simultaneously provide at most two out of three guarantees: Consistency, Availability, and Partition Tolerance.",
        "relevant_chunk_keywords": ["CAP theorem", "Consistency", "Availability", "Partition Tolerance"],
        "category": "fact_retrieval",
        "expected_page": 1,
        "is_unanswerable": False
    },
    {
        "question": "What algorithm minimizes key reorganization when nodes are added or removed using a virtual circular ring?",
        "ground_truth_answer": "Consistent hashing maps both nodes and data keys onto a virtual circular ring of 2^32 positions to minimize key reorganization.",
        "relevant_chunk_keywords": ["Consistent hashing", "virtual circular ring", "reorganization"],
        "category": "fact_retrieval",
        "expected_page": 1,
        "is_unanswerable": False
    },
    {
        "question": "What is the primary motivation for distributed computing?",
        "ground_truth_answer": "The primary motivations are horizontal scalability, fault tolerance, and geographic distribution.",
        "relevant_chunk_keywords": ["horizontal scalability", "fault tolerance", "geographic distribution"],
        "category": "fact_retrieval",
        "expected_page": 1,
        "is_unanswerable": False
    },
    {
        "question": "What are the three discrete states of a Circuit Breaker?",
        "ground_truth_answer": "A circuit breaker has three discrete states: Closed, Open, and Half-Open.",
        "relevant_chunk_keywords": ["Circuit Breaker", "Closed", "Open", "Half-Open"],
        "category": "fact_retrieval",
        "expected_page": 1,
        "is_unanswerable": False
    },
    {
        "question": "What standard is mentioned for distributed tracing trace IDs and span IDs?",
        "ground_truth_answer": "OpenTelemetry standard is utilized for propagating request context across asynchronous service boundaries.",
        "relevant_chunk_keywords": ["OpenTelemetry", "distributed tracing", "trace IDs", "span IDs"],
        "category": "fact_retrieval",
        "expected_page": 1,
        "is_unanswerable": False
    },

    # 2. Multi-sentence / Multi-paragraph Synthesis
    {
        "question": "How does Raft achieve consensus and how is a quorum calculated?",
        "ground_truth_answer": "Raft achieves consensus by decomposing it into leader election, log replication, and safety. A quorum is mathematically defined as floor(N/2) + 1 nodes.",
        "relevant_chunk_keywords": ["Raft", "consensus", "leader election", "log replication", "quorum"],
        "category": "multi_sentence",
        "expected_page": 1,
        "is_unanswerable": False
    },
    {
        "question": "Why are network partitions inevitable, and what architectural tradeoff does this force?",
        "ground_truth_answer": "Network partitions are inevitable in physical infrastructure, which forces distributed system designers to balance consistency against availability during network disruptions.",
        "relevant_chunk_keywords": ["partitions are inevitable", "consistency against availability", "disruptions"],
        "category": "multi_sentence",
        "expected_page": 1,
        "is_unanswerable": False
    },
    {
        "question": "Why is adding randomized jitter important when implementing exponential backoff retries?",
        "ground_truth_answer": "Adding randomized jitter prevents the thundering herd problem, where hundreds of clients simultaneously retry requests at synchronized intervals and overwhelm recovering backends.",
        "relevant_chunk_keywords": ["jitter", "exponential backoff", "thundering herd", "retry"],
        "category": "multi_sentence",
        "expected_page": 1,
        "is_unanswerable": False
    },
    {
        "question": "How do monolithic architectures and microservices differ in handling team growth and blast radius?",
        "ground_truth_answer": "Monoliths suffer from deployment bottlenecks and high blast radius for bugs as teams grow past 50 engineers, whereas microservices provide bounded-context services that can be scaled independently, reducing blast radius at the cost of operational complexity.",
        "relevant_chunk_keywords": ["Monolithic", "blast radius", "Microservices", "50 engineers"],
        "category": "multi_sentence",
        "expected_page": 1,
        "is_unanswerable": False
    },
    {
        "question": "What is the relationship between eventual consistency, Amazon DynamoDB, and Apache Cassandra?",
        "ground_truth_answer": "Amazon DynamoDB and Apache Cassandra prioritize high availability using eventual consistency and vector clocks to ensure replicas converge in the absence of new updates.",
        "relevant_chunk_keywords": ["DynamoDB", "Cassandra", "eventual consistency", "vector clocks"],
        "category": "multi_sentence",
        "expected_page": 1,
        "is_unanswerable": False
    },

    # 3. Cross-document / Comparative Questions
    {
        "question": "Compare synchronous and asynchronous replication in terms of data loss (RPO) and write latency.",
        "ground_truth_answer": "Synchronous replication guarantees zero data loss (RPO = 0) but incurs higher latency equal to the round-trip network time to the slowest replica. Asynchronous replication provides higher throughput and sub-millisecond local latency, but risks data loss during ungraceful primary node failure.",
        "relevant_chunk_keywords": ["synchronous replication", "asynchronous replication", "RPO", "latency"],
        "category": "comparison",
        "expected_page": 1,
        "is_unanswerable": False
    },
    {
        "question": "What are the trade-offs between monolithic architectures and microservices?",
        "ground_truth_answer": "Monoliths offer straightforward local debugging, zero network serialization latency, and transactional ACID guarantees, but face deployment bottlenecks as teams grow. Microservices enable independent autoscaling and polyglot technology stacks, but introduce distributed tracing challenges, network overhead, and eventual consistency dilemmas.",
        "relevant_chunk_keywords": ["Monolithic", "Microservices", "debugging", "autoscaling", "tradeoffs"],
        "category": "comparison",
        "expected_page": 1,
        "is_unanswerable": False
    },
    {
        "question": "How does strong consistency differ from eventual consistency?",
        "ground_truth_answer": "Strong consistency guarantees all read operations return the most recent write, while eventual consistency guarantees replicas will eventually converge to identical values in the absence of new updates.",
        "relevant_chunk_keywords": ["Strong consistency", "eventual consistency", "converge", "recent write"],
        "category": "comparison",
        "expected_page": 1,
        "is_unanswerable": False
    },
    {
        "question": "Compare the Closed state and Open state of a Circuit Breaker.",
        "ground_truth_answer": "In the Closed state, operations proceed normally. In the Open state, requests fail immediately without contacting the downstream dependency to prevent cascading failure.",
        "relevant_chunk_keywords": ["Closed", "Open", "Circuit Breaker", "cascading failures"],
        "category": "comparison",
        "expected_page": 1,
        "is_unanswerable": False
    },
    {
        "question": "Contrast Paxos and Raft in how they approach consensus.",
        "ground_truth_answer": "Both Raft and Paxos establish distributed agreement, but Raft specifically decomposes consensus into understandable components: leader election, log replication, and safety.",
        "relevant_chunk_keywords": ["Raft", "Paxos", "consensus", "leader election"],
        "category": "comparison",
        "expected_page": 1,
        "is_unanswerable": False
    },

    # 4. Summarization / High-level Overviews
    {
        "question": "Summarize the three core pillars of modern cloud observability.",
        "ground_truth_answer": "The three telemetry pillars of cloud observability are Metrics, Logs, and Distributed Tracing.",
        "relevant_chunk_keywords": ["observability", "Metrics", "Logs", "Distributed Tracing"],
        "category": "summarization",
        "expected_page": 1,
        "is_unanswerable": False
    },
    {
        "question": "Provide a brief summary of how consistent hashing works.",
        "ground_truth_answer": "Consistent hashing maps nodes and data keys onto a virtual circular ring of 2^32 positions, ensuring that when nodes fail or are added, only K/N keys are reorganized.",
        "relevant_chunk_keywords": ["Consistent hashing", "virtual circular ring", "2^32", "K/N"],
        "category": "summarization",
        "expected_page": 1,
        "is_unanswerable": False
    },
    {
        "question": "Summarize the key architectural patterns mentioned for distributed systems.",
        "ground_truth_answer": "Key architectural patterns include client-server, peer-to-peer, and event-driven architectures.",
        "relevant_chunk_keywords": ["client-server", "peer-to-peer", "event-driven architectures"],
        "category": "summarization",
        "expected_page": 1,
        "is_unanswerable": False
    },
    {
        "question": "What is the primary purpose of partitioning or sharding in distributed systems?",
        "ground_truth_answer": "Partitioning or sharding divides massive datasets across multiple storage nodes to enable horizontal scaling and distributed load.",
        "relevant_chunk_keywords": ["Partitioning", "sharding", "storage nodes"],
        "category": "summarization",
        "expected_page": 1,
        "is_unanswerable": False
    },
    {
        "question": "Summarize the recovery behavior in the Half-Open state of a circuit breaker.",
        "ground_truth_answer": "In the Half-Open state, a limited number of probe requests are allowed through to test whether the downstream dependency has recovered.",
        "relevant_chunk_keywords": ["Half-Open", "probe requests", "recovery"],
        "category": "summarization",
        "expected_page": 1,
        "is_unanswerable": False
    },

    # 5. Numerical / Quantitative Extraction
    {
        "question": "In a 5-node Raft cluster, exactly how many nodes are required to form a quorum?",
        "ground_truth_answer": "A quorum requires floor(5/2) + 1 = 3 nodes.",
        "relevant_chunk_keywords": ["quorum", "5 nodes", "3 nodes"],
        "category": "numerical",
        "expected_page": 1,
        "is_unanswerable": False
    },
    {
        "question": "What is the size of the virtual circular ring in consistent hashing?",
        "ground_truth_answer": "The virtual circular ring contains 2^32 positions.",
        "relevant_chunk_keywords": ["2^32", "virtual circular ring", "consistent hashing"],
        "category": "numerical",
        "expected_page": 1,
        "is_unanswerable": False
    },
    {
        "question": "How many keys need to be remapped in consistent hashing when a node fails, in terms of K and N?",
        "ground_truth_answer": "Only K/N keys need to be remapped, where K is total keys and N is active servers.",
        "relevant_chunk_keywords": ["K/N", "keys", "remapped", "servers"],
        "category": "numerical",
        "expected_page": 1,
        "is_unanswerable": False
    },
    {
        "question": "What is the target P99 response latency and monthly allowed downtime for 99.99% availability?",
        "ground_truth_answer": "Target P99 response latency is under 120 milliseconds, and 99.99% availability permits under 4.38 minutes of downtime per month.",
        "relevant_chunk_keywords": ["P99", "120 milliseconds", "99.99%", "4.38 minutes"],
        "category": "numerical",
        "expected_page": 1,
        "is_unanswerable": False
    },
    {
        "question": "At what team size do monolithic codebases typically start suffering from deployment bottlenecks?",
        "ground_truth_answer": "When development teams grow past 50 engineers.",
        "relevant_chunk_keywords": ["50 engineers", "monolithic", "bottlenecks"],
        "category": "numerical",
        "expected_page": 1,
        "is_unanswerable": False
    },

    # 6. Adversarial Distractors (similar keywords, subtle distinction)
    {
        "question": "Does synchronous replication eliminate network latency penalties between nodes?",
        "ground_truth_answer": "No, synchronous replication incurs a latency penalty equal to the round-trip network time to the slowest replica.",
        "relevant_chunk_keywords": ["synchronous replication", "latency penalty", "slowest replica"],
        "category": "distractor",
        "expected_page": 1,
        "is_unanswerable": False
    },
    {
        "question": "Can a distributed system guarantee both Consistency and Availability during a network partition according to CAP?",
        "ground_truth_answer": "No, the CAP theorem states a distributed system can simultaneously provide at most two guarantees, and since partitions are inevitable, it must choose between consistency and availability.",
        "relevant_chunk_keywords": ["CAP theorem", "Consistency", "Availability", "at most two"],
        "category": "distractor",
        "expected_page": 1,
        "is_unanswerable": False
    },
    {
        "question": "Does eventual consistency guarantee that read operations always return the latest write immediately?",
        "ground_truth_answer": "No, that is strong consistency. Eventual consistency only guarantees replicas will eventually converge in the absence of new updates.",
        "relevant_chunk_keywords": ["eventual consistency", "strong consistency", "converge"],
        "category": "distractor",
        "expected_page": 1,
        "is_unanswerable": False
    },
    {
        "question": "In the Open state of a circuit breaker, are requests allowed through to probe downstream health?",
        "ground_truth_answer": "No, in the Open state requests fail immediately without contacting the downstream service. Probe requests are only allowed in the Half-Open state.",
        "relevant_chunk_keywords": ["Open state", "Half-Open", "circuit breaker", "probe"],
        "category": "distractor",
        "expected_page": 1,
        "is_unanswerable": False
    },
    {
        "question": "Does microservices architecture eliminate network serialization overhead compared to monoliths?",
        "ground_truth_answer": "No, monoliths have zero network serialization latency between modules, whereas microservices introduce network latency and serialization overhead.",
        "relevant_chunk_keywords": ["serialization", "Monoliths", "Microservices", "network latency"],
        "category": "distractor",
        "expected_page": 1,
        "is_unanswerable": False
    },

    # 7. Deliberately Unanswerable Questions (out-of-domain / not present)
    {
        "question": "What quantum encryption algorithm is used by Vaultonaut to secure satellite communication?",
        "ground_truth_answer": "I couldn't find enough information in your uploaded documents to answer this question.",
        "relevant_chunk_keywords": [],
        "category": "unanswerable",
        "expected_page": None,
        "is_unanswerable": True
    },
    {
        "question": "What were the total quarterly revenues of OpenAI in Q3 2024?",
        "ground_truth_answer": "I couldn't find enough information in your uploaded documents to answer this question.",
        "relevant_chunk_keywords": [],
        "category": "unanswerable",
        "expected_page": None,
        "is_unanswerable": True
    },
    {
        "question": "How do you configure the CUDA kernel thread block size for PyTorch matrix multiplication?",
        "ground_truth_answer": "I couldn't find enough information in your uploaded documents to answer this question.",
        "relevant_chunk_keywords": [],
        "category": "unanswerable",
        "expected_page": None,
        "is_unanswerable": True
    },
    {
        "question": "What is the recipe for brewing traditional Japanese matcha tea?",
        "ground_truth_answer": "I couldn't find enough information in your uploaded documents to answer this question.",
        "relevant_chunk_keywords": [],
        "category": "unanswerable",
        "expected_page": None,
        "is_unanswerable": True
    },
    {
        "question": "Who was the governor general of Canada in the year 1888?",
        "ground_truth_answer": "I couldn't find enough information in your uploaded documents to answer this question.",
        "relevant_chunk_keywords": [],
        "category": "unanswerable",
        "expected_page": None,
        "is_unanswerable": True
    }
]


class DatasetService:
    @staticmethod
    def get_or_create_benchmark_dataset(db: Session, user_id: Optional[uuid.UUID] = None) -> EvaluationDataset:
        """
        Retrieves or initializes the 35-question standard benchmark evaluation dataset.
        """
        dataset = db.query(EvaluationDataset).filter(
            EvaluationDataset.name == "Vaultonaut Technical RAG Benchmark"
        ).first()

        if dataset:
            return dataset

        # Compute category distribution
        cat_counts = {}
        for item in BENCHMARK_ITEMS:
            cat = item["category"]
            cat_counts[cat] = cat_counts.get(cat, 0) + 1

        dataset = EvaluationDataset(
            id=uuid.uuid4(),
            user_id=user_id,
            name="Vaultonaut Technical RAG Benchmark",
            description="35-sample curated golden evaluation dataset covering 7 IR categories: Fact Retrieval, Multi-Sentence Synthesis, Comparison, Summarization, Numerical Extraction, Distractors, and Deliberate Out-of-Domain Refusals.",
            category_distribution=cat_counts
        )
        db.add(dataset)
        db.commit()
        db.refresh(dataset)

        for item_data in BENCHMARK_ITEMS:
            item = EvaluationItem(
                id=uuid.uuid4(),
                dataset_id=dataset.id,
                question=item_data["question"],
                ground_truth_answer=item_data["ground_truth_answer"],
                relevant_chunk_keywords=item_data["relevant_chunk_keywords"],
                expected_page=item_data.get("expected_page"),
                category=item_data["category"],
                is_unanswerable=item_data.get("is_unanswerable", False),
                metadata_json={"sample_id": str(uuid.uuid4())[:8]}
            )
            db.add(item)

        db.commit()
        db.refresh(dataset)
        logger.info(f"Initialized benchmark evaluation dataset with {len(BENCHMARK_ITEMS)} items.")
        return dataset

    @staticmethod
    def get_benchmark_document_content() -> str:
        return BENCHMARK_DOCUMENT_CONTENT

    @staticmethod
    def get_benchmark_document_title() -> str:
        return BENCHMARK_DOCUMENT_TITLE


dataset_service = DatasetService()
