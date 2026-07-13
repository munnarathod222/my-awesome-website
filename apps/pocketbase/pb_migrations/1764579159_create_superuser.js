/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const email = $os.getenv("PB_SUPERUSER_EMAIL") || "munnarathod222@gmail.com"
    const password = $os.getenv("PB_SUPERUSER_PASSWORD") || "cargo123456"

    // Idempotent: skip if a superuser with this email already exists
    try {
        app.findAuthRecordByEmail("_superusers", email)
        // If we reach here, the superuser already exists — nothing to do
        return
    } catch (_) {
        // Not found — safe to create
    }

    const superusers = app.findCollectionByNameOrId("_superusers")
    const record = new Record(superusers)
    record.set("email", email)
    record.set("password", password)
    app.save(record)
})
