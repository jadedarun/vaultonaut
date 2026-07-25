import logging
import sys


def setup_logging():
    """Configures structured Python logging for the Vaultonaut backend."""
    logging_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    logging.basicConfig(
        level=logging.INFO,
        format=logging_format,
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )

    # Silence verbose third-party loggers
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("google").setLevel(logging.WARNING)
    
    logger = logging.getLogger("vaultonaut")
    logger.info("Structured logging initialized for Vaultonaut Backend.")
    return logger


logger = logging.getLogger("vaultonaut")
