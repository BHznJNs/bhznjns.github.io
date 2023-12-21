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
        .then(res => res.body)
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
            console.log("Markdown request error: " + path)
            console.error(err)
        })
}