export class urlCleaner {

    private rawUrl: string;
    constructor(rawUrl: string) {
        this.rawUrl = rawUrl.trim();
    }
    
    cleanUrl(){
        if (!this.rawUrl) {
            throw new Error("URL cannot be empty");
        }
        this.rawUrl = this.rawUrl.replace(/^"|"$/g, '');
        return this;
    }
    
    removeQueryParams() {
        this.rawUrl = this.rawUrl.split("?")[0];
        return this;
    }

    removeHash() {
        this.rawUrl = this.rawUrl.split("#")[0];
        return this;
    }

    httpRemove(){
        this.rawUrl = this.rawUrl.replace(/^https?:\/\//, '');
        return this;
    }

    getCleanUrl() {
        return this.rawUrl;
    }
}