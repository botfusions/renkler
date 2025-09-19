"""
Sanzo N8N MCP Integration Package

A Model Context Protocol (MCP) server for integrating N8N workflow automation
with the Sanzo Color Advisor application.

This package provides tools for:
- N8N workflow execution and monitoring
- Automated workflow triggers
- Workflow status tracking and analytics
- Integration with Sanzo Color Advisor APIs
"""

__version__ = "1.0.0"
__author__ = "Claude Code"
__email__ = "claude@anthropic.com"

from .server import SanzoN8NMCPServer
from .models import *
from .n8n_client import N8NClient
from .workflow_manager import WorkflowManager

__all__ = [
    "SanzoN8NMCPServer",
    "N8NClient",
    "WorkflowManager",
    # Models will be imported via *
]