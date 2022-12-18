import * as sinkStatic from '@adonisjs/sink';
import type { ApplicationContract } from '@ioc:Adonis/Core/Application';

export default async function instructions(
    projectRoot: string,
    app: ApplicationContract,
    sink: typeof sinkStatic
) {
    const rcfile = new sink.files.AdonisRcFile(projectRoot);

    rcfile.setPreload('./start/scheduler', ["console"])

    rcfile.setAlias("Commands", "commands");

    rcfile.commit();

    sink.logger.action('update').succeeded('.adonisrc');

    const tsfile = new sink.files.JsonFile(projectRoot, "tsconfig.json")

    const paths = tsfile.get("compilerOptions.paths");

    if (!paths["Commands/*"]) {
        paths["Commands/*"] = [
            "./commands/*"
        ]
    }

    tsfile.set("compilerOptions.paths", paths)

    tsfile.commit();

    sink.logger.action('update').succeeded('tsconfig.json');
}