import firebase from 'firebase'
import { BehaviorSubject, from, map, Observable, switchMap, tap } from 'rxjs'
import firebaseConfig from '../../config/firebase'


type pdfModel<T extends {
    hebrewFile?: string,
    englishFile?: string,
    linkedinFile?: string,
} = {
    hebrewFile?: string,
    englishFile?: string,
    linkedinFile?: string,
}> = { data: T } & {
    language: keyof T,
}

class FirebaseApi {
    private _firebase: firebase.app.App | any

    private get firebase(): firebase.app.App {
        return this._firebase || firebase
    }

    private get username(): string { return this.user?.uid || this.adminUserName }
    private user: firebase.User | null = null
    private adminUserName: string = 'Hyr14QJ2wHPrMPsurzVP5yumse12'
    public pdf: pdfModel | undefined
    public authStateChanged: BehaviorSubject<firebase.User | null> = new BehaviorSubject<firebase.User | null>(null)

    constructor() {
        !firebase.apps.length &&
            (this._firebase = firebase.initializeApp(firebaseConfig))
        this.onAuthStateChanged((u) => (this.user = u) || this.authStateChanged?.next(u))
    }

    public get keys(): (keyof pdfModel['data'])[] {
        const keys = Object.keys(this.pdf?.data || {})
        if (Object.keys(this.pdf || {})?.length) {
            return keys as (keyof pdfModel['data'])[]
        }
        return ['englishFile', 'hebrewFile', 'linkedinFile']
    }

    private onAuthStateChanged = (nextOrObserver: | firebase.Observer<any> | ((a: firebase.User | null) => any),
        error?: (a: firebase.auth.Error) => any,
        completed?: firebase.Unsubscribe) => this.firebase?.auth().onAuthStateChanged(nextOrObserver, error, completed)

    newPdf = (): Observable<pdfModel> =>
        from(this.firebase.database().ref(`CV/${this.username}/`).set({
            language: 'englishFile', data: {
                hebrewFile: '',
                englishFile: '',
                linkedinFile: '',
            }
        } as pdfModel))

    getPdf = (): Observable<pdfModel> =>
        from(this.firebase.database().ref(`CV/${this.username}/`).once('value'))?.pipe(map(snap => snap?.val()), tap((pdf: pdfModel) => this.pdf = pdf))

    uploadPdf = (uploadedImage: (Blob | Uint8Array | ArrayBuffer) & { name: string }): Observable<string>  => {
        const storageRef = this.firebase.storage().ref();
        const fileRef = storageRef
            .child(`/CV/${this.username}/${uploadedImage.name}`);
        console.log(uploadedImage)
        return from(fileRef.put(uploadedImage))?.pipe(tap(x => console.log(x)), switchMap(uploadTaskSnapshot => from(uploadTaskSnapshot.ref.getDownloadURL())))
    }

    updatePdf = (upData: any): any =>
        from(this.firebase.database().ref(`CV/${this.username}/`).once('value')).pipe(switchMap(snap =>
            from(this.firebase.database().ref(`CV/${this.username}`).set({ ...snap.val(), ...upData } as pdfModel))
        ))

    deleteFile = (url: string) => from(this.firebase.storage().refFromURL(url)?.delete())

    deletePdf = (deletePdfKey: keyof pdfModel['data']): any => {
        const { pdf: pdfSnapshot } = this
        if (!!deletePdfKey && !!pdfSnapshot?.data?.[deletePdfKey]) {
            this.deleteFile(pdfSnapshot?.data?.[deletePdfKey] || '')
            delete pdfSnapshot?.data?.[deletePdfKey]
            pdfSnapshot.language = Object?.keys(pdfSnapshot?.data || {})?.[0] as keyof pdfModel['data']
            return from(this.firebase.database().ref(`CV/${this.username}`).set(pdfSnapshot as pdfModel))?.pipe(tap(() => this.pdf = pdfSnapshot))
        }
    }
}


export default new FirebaseApi() as FirebaseApi