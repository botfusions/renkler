"""
Setup script for Sanzo N8N MCP Integration
"""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="sanzo-n8n-mcp",
    version="1.0.0",
    author="Claude Code",
    author_email="claude@anthropic.com",
    description="MCP server for N8N workflow integration with Sanzo Color Advisor",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/sanzo-color-advisor/mcp-n8n-integration",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: System :: Networking",
        "Topic :: Internet :: WWW/HTTP :: HTTP Servers",
    ],
    python_requires=">=3.11",
    install_requires=requirements,
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-asyncio>=0.21.0",
            "pytest-mock>=3.10.0",
            "pytest-cov>=4.0.0",
            "black>=23.0.0",
            "mypy>=1.0.0",
            "ruff>=0.1.0",
            "pre-commit>=3.0.0",
        ],
        "docs": [
            "sphinx>=5.0.0",
            "sphinx-rtd-theme>=1.0.0",
            "myst-parser>=0.18.0",
        ]
    },
    entry_points={
        "console_scripts": [
            "sanzo-n8n-mcp=sanzo_n8n_mcp.server:main",
        ],
    },
    include_package_data=True,
    zip_safe=False,
    keywords=[
        "mcp",
        "model-context-protocol",
        "n8n",
        "workflow",
        "automation",
        "sanzo",
        "color-advisor",
        "ai",
        "claude",
        "fastmcp"
    ],
    project_urls={
        "Bug Reports": "https://github.com/sanzo-color-advisor/mcp-n8n-integration/issues",
        "Source": "https://github.com/sanzo-color-advisor/mcp-n8n-integration",
        "Documentation": "https://github.com/sanzo-color-advisor/mcp-n8n-integration/blob/main/README.md",
    },
)