import {readdirSync} from 'fs'

export function queryDirectory(dir: string, extension: string = 'ts'): string[] {
    let files: string[] = []

    readdirSync(dir, {withFileTypes: true})
        .forEach(file => {
            if (file.isFile() && file.name.endsWith(extension)) {
                files.push(`${dir}/${file.name}`)
            } else if (file.isDirectory()) {
                queryDirectory(`${dir}/${file.name}`, extension)
                    .forEach((f) => files.push(f))
            }
        })

    return files;
}