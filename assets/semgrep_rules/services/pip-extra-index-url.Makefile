venv/activate/test:
	$(info Creating virtual environment for test at ${VENV_PATH})
	python3.11 -m venv $(VENV_PATH)
	$(VENV_PIP) install --upgrade pip wheel setuptools
    # ruleid: pip-extra-index-url
	$(VENV_PIP) install --extra-index-url ${PYPI_INDEX_URL} --trusted-host ${PYPI_TRUSTED_HOST} my-very-private-package
	$(VENV_PIP) install --editable ${WHATEVER_PATH}/../../shared/horse/