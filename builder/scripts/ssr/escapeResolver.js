export function escapeRSSXML(str) {
    return str.replace(/[&<>'"]/g, function (char) {
        switch (char) {
            case '&':
                return '&amp;';
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '"':
                return '&quot;';
            case "'":
                return '&apos;';
            default:
                return char;
        }
    });
}

export function escapeSitemapXML(str) {
    return str.replace(/[&<>'"]/g, function (char) {
        switch (char) {
            case '&':
                return '&amp;';
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '"':
                return '&quot;';
            case "'":
                return '&apos;';
            default:
                return char;
        }
    });
}
