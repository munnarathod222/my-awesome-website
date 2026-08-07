/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		// 1. vendor_empanelments collection
		const empanelments = new Collection({
			type: "base",
			name: "vendor_empanelments",
			listRule: "",
			viewRule: "",
			createRule: "",
			updateRule: "",
			deleteRule: "",
			fields: [
				{
					autogeneratePattern: "[a-z0-9]{15}",
					hidden: false,
					id: "text_emp_id",
					max: 15,
					min: 15,
					name: "id",
					pattern: "^[a-z0-9]+$",
					presentable: false,
					primaryKey: true,
					required: true,
					system: true,
					type: "text",
				},
				{
					hidden: false,
					id: "text_emp_company",
					name: "company_name",
					required: true,
					type: "text",
				},
				{
					hidden: false,
					id: "text_emp_vendor_id",
					name: "assigned_vendor_id",
					type: "text",
				},
				{
					hidden: false,
					id: "text_emp_ref_no",
					name: "application_ref_no",
					type: "text",
				},
				{
					hidden: false,
					id: "text_emp_category",
					name: "category",
					type: "text",
				},
				{
					hidden: false,
					id: "text_emp_applied_date",
					name: "applied_date",
					type: "text",
				},
				{
					hidden: false,
					id: "text_emp_stage",
					name: "stage",
					type: "text",
				},
				{
					hidden: false,
					id: "text_emp_officer",
					name: "procurement_officer",
					type: "text",
				},
				{
					hidden: false,
					id: "text_emp_phone",
					name: "officer_phone",
					type: "text",
				},
				{
					hidden: false,
					id: "text_emp_email",
					name: "officer_email",
					type: "text",
				},
				{
					hidden: false,
					id: "text_emp_portal",
					name: "portal_url",
					type: "text",
				},
				{
					hidden: false,
					id: "text_emp_fleet",
					name: "allocated_fleet",
					type: "text",
				},
				{
					hidden: false,
					id: "text_emp_status",
					name: "status",
					type: "text",
				},
				{
					hidden: false,
					id: "text_emp_notes",
					name: "notes",
					type: "text",
				},
				{
					hidden: false,
					id: "date_emp_created",
					name: "created",
					onCreate: true,
					onUpdate: false,
					type: "autodate",
				},
				{
					hidden: false,
					id: "date_emp_updated",
					name: "updated",
					onCreate: true,
					onUpdate: true,
					type: "autodate",
				}
			],
		});
		app.save(empanelments);

		// 2. subcontractor_vendors collection
		const subcontractors = new Collection({
			type: "base",
			name: "subcontractor_vendors",
			listRule: "",
			viewRule: "",
			createRule: "",
			updateRule: "",
			deleteRule: "",
			fields: [
				{
					autogeneratePattern: "[a-z0-9]{15}",
					hidden: false,
					id: "text_sub_id",
					max: 15,
					min: 15,
					name: "id",
					pattern: "^[a-z0-9]+$",
					presentable: false,
					primaryKey: true,
					required: true,
					system: true,
					type: "text",
				},
				{
					hidden: false,
					id: "text_sub_vendor_id",
					name: "issued_jbc_vendor_id",
					type: "text",
				},
				{
					hidden: false,
					id: "text_sub_name",
					name: "subcontractor_name",
					required: true,
					type: "text",
				},
				{
					hidden: false,
					id: "text_sub_owner",
					name: "owner_name",
					type: "text",
				},
				{
					hidden: false,
					id: "text_sub_phone",
					name: "phone",
					type: "text",
				},
				{
					hidden: false,
					id: "text_sub_email",
					name: "email",
					type: "text",
				},
				{
					hidden: false,
					id: "text_sub_pan",
					name: "pan",
					type: "text",
				},
				{
					hidden: false,
					id: "text_sub_aadhaar",
					name: "aadhaar",
					type: "text",
				},
				{
					hidden: false,
					id: "num_sub_trucks",
					name: "attached_trucks_count",
					type: "number",
				},
				{
					hidden: false,
					id: "text_sub_numbers",
					name: "truck_numbers",
					type: "text",
				},
				{
					hidden: false,
					id: "text_sub_commission",
					name: "commission_rate",
					type: "text",
				},
				{
					hidden: false,
					id: "text_sub_bank",
					name: "bank_name",
					type: "text",
				},
				{
					hidden: false,
					id: "text_sub_account",
					name: "account_number",
					type: "text",
				},
				{
					hidden: false,
					id: "text_sub_ifsc",
					name: "ifsc_code",
					type: "text",
				},
				{
					hidden: false,
					id: "text_sub_status",
					name: "status",
					type: "text",
				},
				{
					hidden: false,
					id: "text_sub_notes",
					name: "notes",
					type: "text",
				},
				{
					hidden: false,
					id: "date_sub_created",
					name: "created",
					onCreate: true,
					onUpdate: false,
					type: "autodate",
				},
				{
					hidden: false,
					id: "date_sub_updated",
					name: "updated",
					onCreate: true,
					onUpdate: true,
					type: "autodate",
				}
			],
		});
		app.save(subcontractors);

		// 3. vendors collection
		const vendors = new Collection({
			type: "base",
			name: "vendors",
			listRule: "",
			viewRule: "",
			createRule: "",
			updateRule: "",
			deleteRule: "",
			fields: [
				{
					autogeneratePattern: "[a-z0-9]{15}",
					hidden: false,
					id: "text_vnd_id",
					max: 15,
					min: 15,
					name: "id",
					pattern: "^[a-z0-9]+$",
					presentable: false,
					primaryKey: true,
					required: true,
					system: true,
					type: "text",
				},
				{
					hidden: false,
					id: "text_vnd_company",
					name: "company_name",
					required: true,
					type: "text",
				},
				{
					hidden: false,
					id: "text_vnd_type",
					name: "vendor_type",
					type: "text",
				},
				{
					hidden: false,
					id: "text_vnd_contact",
					name: "contact_person",
					type: "text",
				},
				{
					hidden: false,
					id: "text_vnd_phone",
					name: "phone",
					type: "text",
				},
				{
					hidden: false,
					id: "text_vnd_email",
					name: "email",
					type: "text",
				},
				{
					hidden: false,
					id: "text_vnd_gstin",
					name: "gstin",
					type: "text",
				},
				{
					hidden: false,
					id: "text_vnd_pan",
					name: "pan",
					type: "text",
				},
				{
					hidden: false,
					id: "text_vnd_bank",
					name: "bank_name",
					type: "text",
				},
				{
					hidden: false,
					id: "text_vnd_account",
					name: "account_number",
					type: "text",
				},
				{
					hidden: false,
					id: "text_vnd_ifsc",
					name: "ifsc_code",
					type: "text",
				},
				{
					hidden: false,
					id: "text_vnd_city",
					name: "city",
					type: "text",
				},
				{
					hidden: false,
					id: "text_vnd_terms",
					name: "payment_terms",
					type: "text",
				},
				{
					hidden: false,
					id: "text_vnd_status",
					name: "status",
					type: "text",
				},
				{
					hidden: false,
					id: "date_vnd_created",
					name: "created",
					onCreate: true,
					onUpdate: false,
					type: "autodate",
				},
				{
					hidden: false,
					id: "date_vnd_updated",
					name: "updated",
					onCreate: true,
					onUpdate: true,
					type: "autodate",
				}
			],
		});
		app.save(vendors);
	},
	(app) => {
		try {
			const empanelments = app.findCollectionByNameOrId("vendor_empanelments");
			app.delete(empanelments);
		} catch(e) {}
		try {
			const subcontractors = app.findCollectionByNameOrId("subcontractor_vendors");
			app.delete(subcontractors);
		} catch(e) {}
		try {
			const vendors = app.findCollectionByNameOrId("vendors");
			app.delete(vendors);
		} catch(e) {}
	},
);
