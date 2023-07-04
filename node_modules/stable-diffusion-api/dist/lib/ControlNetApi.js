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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlNetApi = void 0;
const base64_1 = require("../utils/base64");
const StableDiffusionResult_1 = __importDefault(require("./StableDiffusionResult"));
/**
 * @class ControlNetApi
 * @classdesc ControlNet API, a translation layer for Mikubill's ControlNet API
 * @param {StableDiffusionApi} Stable Diffusion parent API
 */
class ControlNetApi {
    constructor(sd) {
        this.sd = sd;
    }
    /**
     * Uses the selected ControlNet proprocessor module to predict a detection
     * on the input image
     * @param {ControlNetDetectOptions} options
     * @returns {Promise<StableDiffusionResult>} ApiResult with the detection result
     * @example
     * const api = new StableDiffusionApi();
     * const image = sharp("image.png");
     *
     * const result = await api.controlnet.detect({
     *   controlnet_input_images: [image],
     *   controlnet_module: "depth",
     *   controlnet_processor_res: 512,
     *   controlnet_threshold_a: 64,
     *   controlnet_threshold_b: 64,
     * });
     *
     * result.image.toFile("result.png");
     */
    detect(options) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const input_images = yield Promise.all(options.controlnet_input_images.map((image) => __awaiter(this, void 0, void 0, function* () { return yield (0, base64_1.toBase64)(image); })));
            const response = yield this.sd.api.post("/controlnet/detect", {
                controlnet_module: (_a = options.controlnet_module) !== null && _a !== void 0 ? _a : "none",
                controlnet_input_images: input_images,
                controlnet_processor_res: (_b = options.controlnet_processor_res) !== null && _b !== void 0 ? _b : 512,
                controlnet_threshold_a: (_c = options.controlnet_threshold_a) !== null && _c !== void 0 ? _c : 64,
                controlnet_threshold_b: (_d = options.controlnet_threshold_b) !== null && _d !== void 0 ? _d : 64,
            });
            return new StableDiffusionResult_1.default(response);
        });
    }
    /**
     * Returns a list of available ControlNet models
     * @returns {Promise<string[]>} List of available ControlNet models
     */
    getModels() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.sd.api.get("/controlnet/model_list");
            return response.data.model_list;
        });
    }
    /**
     * Returns a list of available ControlNet modules
     * @returns {Promise<string[]>} List of available ControlNet modules
     */
    getModules() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.sd.api.get("/controlnet/module_list");
            return response.data.module_list;
        });
    }
}
exports.ControlNetApi = ControlNetApi;
