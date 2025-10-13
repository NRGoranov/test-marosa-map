class MetaTagRewriter {
    constructor(content) {
        this.content = content;
    }

    element(element) {
        element.setAttribute('content', this.content);
    }
}

export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    const path = url.pathname;

    const response = await context.next();

    if (!response.headers.get('Content-Type')?.startsWith('text/html')) {
        return response;
    }

    const htmlRewriter = new HTMLRewriter();

    if (path === '/brochure') {
        htmlRewriter
            .on('meta[property="og:title"]', new MetaTagRewriter('Мароса Градина - Каталог 2025'))
            .on('meta[property="og:description"]', new MetaTagRewriter('Разгледайте най-новия ни продуктов каталог за градината.'));
    } else if (path === '/') {
        htmlRewriter
            .on('meta[property="og:title"]', new MetaTagRewriter('Мароса Градина Карта'))
            .on('meta[property="og:description"]', new MetaTagRewriter('Намерете най-близкия до вас търговски обект.'));
    }

    return htmlRewriter.transform(response);
}