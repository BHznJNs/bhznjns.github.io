export async function fetchJSON(path) {
    return await fetch(path)
        .then(res => res.json())
        .catch(err => {
            console.log("JSON request error: " + path)
            console.error(err)
        })
}

export async function fetchMD(path) {
    return await fetch(path)
        .then(res => {
            if (res.status != 200) {
                throw res.status
            }
            return res.body
        })
        .then(async body => {
            const reader = body.getReader()
            const decoder = new TextDecoder('utf-8');
            let totalData = "";
            const processor = (result) => {
                if (result.done) {
                    return totalData
                }
                totalData += decoder.decode(result.value, { stream: true })
                return reader.read().then(processor);
            }
            const result = await reader.read();
            return processor(result);
        })
        .catch(err => {
            switch (err) {
                // render error code in markdown format
                case 404:
                    return "# 404 Not Found"
                case 500:
                    return "# 500 Internal Server Error"
                default:
                    console.log("Markdown request error: " + path)
                    console.error(err)
            }
        })
}