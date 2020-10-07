const { assert } = require('chai');
const { technicalUser, softwareData } = require('./lib/globals.js');
const createInvoiceOperations = require('./lib/create-invoice-operations.js');

const NavConnector = require('../src/nav-connector.js');

const defaultBaseUrl = 'https://api.onlineszamla.nav.gov.hu/invoiceService/v3/';
const baseURL = 'https://api-test.onlineszamla.nav.gov.hu/invoiceService/v3/';

describe('NavConnector', () => {
  it('should assign technicalUser to the new instance', () => {
    const navConnector = new NavConnector({
      technicalUser,
      softwareData,
      baseURL,
    });

    assert.deepEqual(navConnector.technicalUser, technicalUser);
  });

  it('should assign softwareData to the new instance', () => {
    const navConnector = new NavConnector({
      technicalUser,
      softwareData,
      baseURL,
    });

    assert.deepEqual(navConnector.softwareData, softwareData);
  });

  it('should set axios default baseURL', () => {
    const navConnector = new NavConnector({
      technicalUser,
      softwareData,
      baseURL,
    });

    assert.equal(navConnector.axios.defaults.baseURL, baseURL);
  });

  it('should use default axios baseURL when omitted', () => {
    const navConnector = new NavConnector({
      technicalUser,
      softwareData,
    });

    assert.equal(navConnector.axios.defaults.baseURL, defaultBaseUrl);
  });

  it('should set axios default timeout', () => {
    const timeout = 65000;
    const navConnector = new NavConnector({
      technicalUser,
      softwareData,
      timeout,
    });

    assert.equal(navConnector.axios.defaults.timeout, timeout);
  });

  it('should use default axios timeout when omitted', () => {
    const defaultTimeout = 70000;
    const navConnector = new NavConnector({
      technicalUser,
      softwareData,
    });

    assert.equal(navConnector.axios.defaults.timeout, defaultTimeout);
  });

  it('should set proper http headers to axios', () => {
    const navConnector = new NavConnector({
      technicalUser,
      softwareData,
      baseURL,
    });

    const expectedHeaders = {
      'content-type': 'application/xml',
      accept: 'application/xml',
      encoding: 'UTF-8',
    };

    assert.deepInclude(navConnector.axios.defaults.headers, expectedHeaders);
  });

  describe('manageInvoice()', () => {
    it('should resolve to transactionId', async () => {
      const navConnector = new NavConnector({
        technicalUser,
        softwareData,
        baseURL,
      });

      const invoiceOperation = createInvoiceOperations({
        taxNumber: technicalUser.taxNumber,
      }).slice(0, 1);

      const invoiceOperations = {
        compressedContent: false,
        invoiceOperation,
      };

      const transactionId = await navConnector.manageInvoice(invoiceOperations);

      assert.match(transactionId, /^[+a-zA-Z0-9_]{1,30}$/);
    });
  });

  describe('manageAnnulment()', () => {
    it('should resolve to transactionId', async () => {
      const navConnector = new NavConnector({
        technicalUser,
        softwareData,
        baseURL,
      });

      const annulmentOperation = createInvoiceOperations({
        taxNumber: technicalUser.taxNumber,
      })
        .slice(0, 1)
        .map(({ invoiceData, invoiceOperation, index }) => ({
          index,
          annulmentOperation: 'ANNUL',
          invoiceAnnulment: invoiceData,
        }));

      const annulmentOperations = {
        annulmentOperation,
      };

      const transactionId = await navConnector.manageAnnulment(
        annulmentOperations
      );

      assert.match(transactionId, /^[+a-zA-Z0-9_]{1,30}$/);
    });
  });

  describe('queryTransactionStatus()', () => {
    it('should resolve to processingResults', async () => {
      const navConnector = new NavConnector({
        technicalUser,
        softwareData,
        baseURL,
      });

      const invoiceOperation = createInvoiceOperations({
        taxNumber: technicalUser.taxNumber,
      }).slice(0, 1);

      const invoiceOperations = {
        compressedContent: false,
        invoiceOperation,
      };

      const transactionId = await navConnector.manageInvoice(invoiceOperations);

      const processingResults = await navConnector.queryTransactionStatus({
        transactionId,
      });

      assert.isArray(processingResults);
    });
  });

  describe('testConnection()', () => {
    it('should not throw if user given auth data and key is valid', async () => {
      const navConnector = new NavConnector({
        technicalUser,
        softwareData,
        baseURL,
      });

      await navConnector.testConnection();
    });
  });

  describe('queryInvoiceData()', () => {
    it('should resolve with invoiceQuery param', async () => {
      const navConnector = new NavConnector({
        technicalUser,
        softwareData,
        baseURL,
      });

      const invoiceQuery = {
        invoiceNumber: 'invoiceNumber',
        invoiceDirection: 'OUTBOUND',
      };

      const { queryResult } = await navConnector.queryInvoiceData({
        invoiceQuery,
      });

      assert.isUndefined(queryResult);
    });
  });

  describe('queryTaxpayer()', () => {
    it('should resolve to taxpayer information if taxpayer is valid', async () => {
      const navConnector = new NavConnector({
        technicalUser,
        softwareData,
        baseURL,
      });

      const taxpayerInfo = await navConnector.queryTaxpayer('15789934');

      assert.hasAllKeys(taxpayerInfo, ['taxpayerValidity', 'taxpayerData']);
    });
  });
});
