import { SEED_TEMPLATES } from '../data/templates.seed';
import { apiService } from '../services/api.service';

export const seedService = {
    async seedTemplates() {
        console.log('Starting template seeding...');
        let count = 0;

        // First, check what exists to avoid duplicates (naive check by name)
        const existing = await apiService.getTemplates({ is_archived: false });
        const existingNames = new Set(existing.map((t: any) => t.name));

        for (const template of SEED_TEMPLATES) {
            if (existingNames.has(template.name)) {
                console.log(`Skipping ${template.name}, already exists.`);
                continue;
            }

            try {
                await apiService.createTemplate({
                    ...template,
                    tags: [template.category] // Use category as tag
                });
                count++;
                console.log(`Created ${template.name}`);
            } catch (err) {
                console.error(`Failed to create ${template.name}`, err);
            }
        }

        return count;
    }
};
