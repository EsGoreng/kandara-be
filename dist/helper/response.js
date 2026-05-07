export function sendSuccess(res, data = null, message = "Success", status = 200) {
    return res.status(status).json({
        status: "success",
        message,
        data,
    });
}
/**
 * Send an error response
 * @param res - Express Response object
 * @param error - Error message or Error object
 * @param status - HTTP status code (default: 500)
 */
export function sendError(res, error, status = 500) {
    const payload = {
        status: "error",
        message: typeof error === "string"
            ? error
            : error?.message || "Internal Server Error",
    };
    if (error && typeof error === "object" && error.errors) {
        payload.errors = error.errors;
    }
    return res.status(status).json(payload);
}
