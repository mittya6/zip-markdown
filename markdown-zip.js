function handleFile(f) {
    JSZip.loadAsync(f)
        .then(async function (zip) {
            const md = window.markdownit();

            // zip info collection
            let mdRelativePath
            let imageRelativePaths = []
            zip.forEach(function (relativePath, zipEntry) {
                if (relativePath.endsWith('.md')) {
                    mdRelativePath = relativePath;
                } else {
                    imageRelativePaths.push(relativePath)
                }
            });

            // input check
            if (!mdRelativePath) {
                alert('markdown file is not exist')
                return
            }
            const rootDir = dirname(mdRelativePath)

            // make dom from markdown
            const parser = new DOMParser()
            const result = md.render(await zip.file(mdRelativePath).async("string"))
            const doc = parser.parseFromString(result, "text/html")

            // conver img src url to data uri
            for (tarImg of doc.querySelectorAll('img')) {
                const src = optimizedDirname(rootDir + tarImg.getAttribute('src'))
                console.log(src)
                if (imageRelativePaths.includes(src)) {
                    tarImg.src = "data:image/jpg;base64," + (await zip.file(src).async("base64"))
                }
            }

            document.body.append(doc.body)
        }, function (e) {
            console.log('errot')
        });

    function dirname(path) {
        const dir =  path.match(/.*\//)
        if(!dir){
            return ""
        }
        return dir
    }

    function optimizedDirname(path){
        let newPath = path
        // cut the head of "./" 
        newPath = newPath.replace(/^\.\//, '')
        // convert "/./" to "/"
        newPath = newPath.replace(/\/\.\//, '/')
        // conver "/XXX/../" to "/"
        newPath = newPath.replace(/\/.+?\/\.\.\//, '/')

        return newPath
    }
}