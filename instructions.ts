import * as sinkStatic from '@adonisjs/sink';
import type { ApplicationContract } from '@ioc:Adonis/Core/Application';

export default async function instructions(
    projectRoot: string,
    app: ApplicationContract,
    sink: typeof sinkStatic
) {
    const rcfile = new sink.files.AdonisRcFile(projectRoot);

    rcfile.setPreload('./start/scheduler', ["console"])

    rcfile.commit();

    sink.logger.action('update').succeeded('.adonisrc');
}