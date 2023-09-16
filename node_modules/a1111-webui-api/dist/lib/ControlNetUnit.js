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
exports.ControlNetUnit = void 0;
const base64_1 = require("../utils/base64");
/**
 * @class ControlNetUnit
 * @classdesc ControlNet Unit, a translation layer for [Mikubill's ControlNet API](https://github.com/Mikubill/sd-webui-controlnet)
 * @param {ControlNetUnitConfig} config Configuration for the ControlNet Unit
 * @example
 * const api = new StableDiffusionApi();
 * const image = sharp("image.png");
 *
 * const unit = new ControlNetUnit({
 *   input_image: image,
 *   module: "depth",
 *   model: "depth",
 * });
 *
 * const result = await api.txt2img({
 *   prompt: "Someone who pretends to be a world-renowned artist, but is actually a random person who prompts text and presses buttons",
 *   init_images: [image],
 *   controlnet_units: [unit],
 * })
 *
 * result.image.toFile("result.png");
 */
class ControlNetUnit {
    constructor(config) {
        this.config = config;
    }
    toJson() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        return __awaiter(this, void 0, void 0, function* () {
            const input_image = yield (0, base64_1.toBase64)(this.config.input_image);
            const mask = this.config.mask && (yield (0, base64_1.toBase64)(this.config.mask));
            return {
                input_image,
                mask,
                module: (_a = this.config.module) !== null && _a !== void 0 ? _a : "none",
                model: (_b = this.config.model) !== null && _b !== void 0 ? _b : "None",
                weight: (_c = this.config.weight) !== null && _c !== void 0 ? _c : 1,
                resize_mode: (_d = this.config.resize_mode) !== null && _d !== void 0 ? _d : "Scale to Fit (Inner Fit)",
                lowvram: (_e = this.config.lowvram) !== null && _e !== void 0 ? _e : false,
                processor_res: (_f = this.config.processor_res) !== null && _f !== void 0 ? _f : 64,
                threshold_a: (_g = this.config.threshold_a) !== null && _g !== void 0 ? _g : 64,
                threshold_b: (_h = this.config.threshold_b) !== null && _h !== void 0 ? _h : 64,
                guidance: (_j = this.config.guidance) !== null && _j !== void 0 ? _j : 1,
                guidance_start: (_k = this.config.guidance_start) !== null && _k !== void 0 ? _k : 0,
                guidance_end: (_l = this.config.guidance_end) !== null && _l !== void 0 ? _l : 1,
                guessmode: (_m = this.config.guessmode) !== null && _m !== void 0 ? _m : false,
            };
        });
    }
}
exports.ControlNetUnit = ControlNetUnit;
