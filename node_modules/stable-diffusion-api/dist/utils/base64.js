"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBase64 = void 0;
/**
 * Converts an image buffer to base64
 *
 * @param {Buffer} image image buffer to convert to base64
 * @param {boolean} raw if true, returns the raw base64 string, if false, returns a data url with the base64 string
 * @returns {Promise<string>} base64 encoded image
 */
function toBase64(image, raw = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const header = "data:image/png;base64,";
        const result = raw
            ? (yield image.raw().toBuffer()).toString("base64")
            : header + (yield image.png().toBuffer()).toString("base64");
        return result;
    });
}
exports.toBase64 = toBase64;
