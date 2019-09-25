// https://stackoverflow.com/questions/39877156/how-to-extend-string-prototype-and-use-it-next-in-typescript
declare module global {
    interface String {
        startsWith(term: string): boolean;
    }

    interface String {
        contains(term: string): boolean;
    }

}
