/**
 * Jest Polyfills
 *
 * This file runs BEFORE jest.setup.ts and provides necessary polyfills
 * for the Node.js environment.
 *
 * Polyfills are loaded here to ensure they're available before MSW is initialized.
 */

// 1. TextEncoder/TextDecoder
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// 2. Web Streams API
const { ReadableStream, WritableStream, TransformStream } = require('stream/web');
global.ReadableStream = ReadableStream;
global.WritableStream = WritableStream;
global.TransformStream = TransformStream;

// 3. MessageChannel and MessagePort (needed by undici)
const { MessageChannel, MessagePort } = require('worker_threads');
global.MessageChannel = MessageChannel;
global.MessagePort = MessagePort;

// 4. Fetch API from undici (now safe to import)
const { fetch, Request, Response, Headers, FormData } = require('undici');
global.fetch = fetch;
global.Request = Request;
global.Response = Response;
global.Headers = Headers;
global.FormData = FormData;
