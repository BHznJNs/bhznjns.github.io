export async function fetchJSON(path) {
    return await fetch(path)
        .then(res => res.json())
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
}