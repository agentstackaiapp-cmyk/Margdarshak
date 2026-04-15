"""Core module for configuration and utilities"""
# Lazy import — don't instantiate Settings at import time
# This prevents crashes when env vars aren't yet available

def get_settings():
    from .config import settings
    return settings

__all__ = ['get_settings']
