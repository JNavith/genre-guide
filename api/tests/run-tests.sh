# Don't waste space in the container when tests aren't being run
pip install pytest==${pytest_version}

cd /app
pytest -p no:cacheprovider -v
