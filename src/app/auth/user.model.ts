export class User{
    constructor(
        public email: string,
        public id: string,
        private _token: string, // private because token should not be retrievable
        private _tokenExprationDate: Date
    ) {}

    get token() {
        if (!this._tokenExprationDate || new Date() > this._tokenExprationDate) {
            return null;
        }
        return this._token;
    }



}