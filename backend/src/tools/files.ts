import * as mime from 'mime-types'
import { readdir, stat, readFile, access } from 'fs/promises'
import { constants } from 'fs'
import { join } from 'path'
export async function readInfoJson(filepath: string): Promise<any | null> {
	try {
		await access(filepath, constants.R_OK | constants.W_OK)
		const data = JSON.stringify(await readFile(filepath))
		return data
	} catch {
		return null
	}
}

export async function getDirectories(folder: string): Promise<Array<string>> {
	const entries = await readdir(folder)
	const directories = []
	for (const entry of entries) {
		if ((await stat(join(folder, entry))).isDirectory()) {
			directories.push(entry)
		}
	}
	return directories
}

export async function getFilesOfTypes(
	folder: string,
	types: Array<string>
): Promise<Array<string>> {
	const entries = await readdir(folder)
	const files = []
	for (const entry of entries) {
		if ((await stat(join(folder, entry))).isFile()) {
			const mimeType = mime.lookup(entry)
			if (mimeType && types.includes(mimeType)) {
				files.push(entry)
			}
		}
	}
	return files
}

export async function getAudioFiles(folder: string): Promise<Array<string>> {
	const valid_types = [
		mime.contentType('mp3') || '',
		mime.contentType('ogg') || '',
		mime.contentType('flac') || '',
	]
	return getFilesOfTypes(folder, valid_types)
}
export async function getImageFiles(folder: string): Promise<Array<string>> {
	const valid_types = [
		mime.contentType('jpg') || '',
		mime.contentType('png') || '',
		mime.contentType('jpng') || '',
		mime.contentType('gif') || '',
	]
	return getFilesOfTypes(folder, valid_types)
}
