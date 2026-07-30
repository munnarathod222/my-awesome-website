/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    let settings = app.settings();

    // Disable rate limits for smooth data sync & API operations
    settings.rateLimits = {
        enabled: false,
        rules: []
    };

    app.save(settings);
    console.log("[migration] Rate limits disabled for high performance API operations.");
}, (app) => {
    // Rollback (no-op)
});
