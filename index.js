/* eslint-disable */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('apollo-link'), require('apollo-fetch'), require('apollo-link-batch'), require('graphql/language/printer')) :
	typeof define === 'function' && define.amd ? define(['exports', 'apollo-link', 'apollo-fetch', 'apollo-link-batch', 'graphql/language/printer'], factory) :
	(factory((global.apolloLink = global.apolloLink || {}, global.apolloLink.batchHttp = {}),global.apolloLink.core,global.apolloFetch,global.apolloLink.batch,global.printer));
}(this, (function (exports,apolloLink,apolloFetch,apolloLinkBatch,printer) { 'use strict';

var __extends = (this && this.__extends) || (function () {
  var extendStatics = Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
  return function (d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
  for (var s, i = 1, n = arguments.length; i < n; i++) {
    s = arguments[i];
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
      t[p] = s[p];
  }
  return t;
};
var DedupBatchHttpLink = (function (_super) {
  __extends(DedupBatchHttpLink, _super);
  function DedupBatchHttpLink(fetchParams) {
    var _this = _super.call(this) || this;
    _this.inFlightRequestObservables = new Map();
    _this.subscribers = new Map();
    _this.headers = {};
    _this.batchInterval = (fetchParams && fetchParams.batchInterval) || 10;
    _this.batchMax = (fetchParams && fetchParams.batchMax) || 10;
    _this.apolloFetch =
      (fetchParams && fetchParams.fetch) ||
        apolloFetch.createApolloFetch({ uri: fetchParams && fetchParams.uri });
    _this.apolloFetch.batchUse(function (request, next) {
      request.options.headers = __assign({}, request.options.headers, _this.headers);
      next();
    });
    var batchHandler = function (operations) {
      return new apolloLink.Observable(function (observer) {
        var printedOperations = operations.map(function (operation) {
          return (__assign({}, operation, { query: printer.print(operation.query) }));
        });
        _this.apolloFetch(printedOperations)
          .then(function (data) {
          observer.next(data);
          observer.complete();
        })
          .catch(observer.error.bind(observer));
      });
    };
    _this.batcher = new apolloLinkBatch.BatchLink({
      batchInterval: _this.batchInterval,
      batchMax: _this.batchMax,
      batchHandler: batchHandler,
    });
    return _this;
  }
  DedupBatchHttpLink.prototype.request = function (operation) {
    var _this = this
    _this.headers = operation.getContext().headers || _this.headers;
    if (operation.getContext().forceFetch) {
      return _this.batcher.request(operation);
    }
    var key = operation.toKey();
    var cleanup = function(key) {
      _this.inFlightRequestObservables.delete(key);
      var prev = _this.subscribers.get(key);
      return prev;
    };

    if (!_this.inFlightRequestObservables.get(key)) {
      // this is a new request, i.e. we haven't deduplicated it yet
      // call the next link
      var singleObserver = _this.batcher.request(operation);
      var subscription;

      var sharedObserver = new apolloLink.Observable(function(observer) {
        // this will still be called by each subscriber regardless of
        // deduplication status
        var prev = _this.subscribers.get(key);
        if (!prev) prev = { next: [], error: [], complete: [] };

        _this.subscribers.set(key, {
          next: prev.next.concat([observer.next.bind(observer)]),
          error: prev.error.concat([observer.error.bind(observer)]),
          complete: prev.complete.concat([observer.complete.bind(observer)]),
        });

        if (!subscription) {
          subscription = singleObserver.subscribe({
            next: function(result) {
              var prev = cleanup(key);
              _this.subscribers.delete(key);
              if (prev) {
                prev.next.forEach(function(next) {
                  return next(result)
                });
                prev.complete.forEach(function(complete) {
                  return complete()
                });
              }
            },
            error: function(error){
              var prev = cleanup(key);
              _this.subscribers.delete(key);
              if (prev) {
                prev.error.forEach(function(err) {
                  return err(error)
                });
              }
            },
          });
        }

        return function() {
          if (subscription) subscription.unsubscribe();
          _this.inFlightRequestObservables.delete(key);
        };
      });

      _this.inFlightRequestObservables.set(key, sharedObserver);
    }

    // return shared Observable
    return _this.inFlightRequestObservables.get(key);
  };
  return DedupBatchHttpLink;
}(apolloLink.ApolloLink));

exports.DedupBatchHttpLink = DedupBatchHttpLink;

Object.defineProperty(exports, '__esModule', { value: true });

})));
/* eslint-enable */
