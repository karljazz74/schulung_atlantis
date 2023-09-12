export class PhotoServiceSchulung {
    getImages() {
        return fetch('/demo/data/photos_schulung.json', { headers: { 'Cache-Control': 'no-cache' } })
            .then((res) => res.json())
            .then((d) => d.data);
    }
}
