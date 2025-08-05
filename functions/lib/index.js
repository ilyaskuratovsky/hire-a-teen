"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.twilioStatusCallback = exports.jobInsert = exports.submitJob = void 0;
//import * as v1 from "firebase-functions/v1";
const app_1 = require("firebase-admin/app");
(0, app_1.initializeApp)();
var submitJob_1 = require("./submitJob");
Object.defineProperty(exports, "submitJob", { enumerable: true, get: function () { return submitJob_1.submitJob; } });
var jobInsert_1 = require("./jobInsert");
Object.defineProperty(exports, "jobInsert", { enumerable: true, get: function () { return jobInsert_1.jobInsert; } });
var twilioStatusCallback_1 = require("./twilioStatusCallback");
Object.defineProperty(exports, "twilioStatusCallback", { enumerable: true, get: function () { return twilioStatusCallback_1.twilioStatusCallback; } });
//# sourceMappingURL=index.js.map