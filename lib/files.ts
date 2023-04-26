import { readdir, readFile, stat } from 'fs/promises'
import { basename, dirname, join } from 'path'

const ignoredFiles = ['pages/404.mdx']

type WalkEntry = {
  path: string
  parentPath?: string
}
async function walk(dir: string, parentPath?: string): Promise<WalkEntry[]> {
  const immediateFiles = await readdir(dir)

  const recursiveFiles = await Promise.all(
    immediateFiles.map(async (file) => {
      const path = join(dir, file)
      const stats = await stat(path)
      if (stats.isDirectory()) {
        // Keep track of document hierarchy (if this dir has corresponding doc file)
        const docPath = `${basename(path)}.mdx`

        return walk(
          path,
          immediateFiles.includes(docPath) ? join(dirname(path), docPath) : parentPath
        )
      } else if (stats.isFile()) {
        return [
          {
            path: path,
            parentPath,
          },
        ]
      } else {
        return []
      }
    })
  )

  const flattenedFiles = recursiveFiles.reduce(
    (all, folderContents) => all.concat(folderContents),
    []
  )

  return flattenedFiles.sort((a, b) => a.path.localeCompare(b.path))
}


walk('pages').then(list =>{
  const files = list.filter(({ path }) => /\.mdx?$/.test(path))
  .filter(({ path }) => !ignoredFiles.includes(path))

    files.forEach(({ path, parentPath }) => {
      console.log(path.replace("pages\\docs\\","")
        .replace(".mdx","")
        .replace("\\","：")
      )
    })
    console.log("準備好：",files.length,"個中国法律檔案")
  })