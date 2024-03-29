import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { Observable } from 'rxjs';
import { _throw } from 'rxjs/observable/throw';
import { catchError } from 'rxjs/operators';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/mergeMap';

@Injectable()
export class InterceptorProvider implements HttpInterceptor {

    constructor(private storage: Storage) { }

    // Intercepts all HTTP requests!
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        let promise = this.storage.get('auth-token');
        return Observable.fromPromise(promise)
            .mergeMap(token => {
                let clonedReq = InterceptorProvider.addToken(request, token);
                return next.handle(clonedReq).pipe(
                    catchError(error => {
                        console.log(error.message);

                        // Pass the error to the caller of the function
                        return _throw(error);
                    })
                );
            });
    }

    // Adds the token to your headers if it exists
    private static addToken(request: HttpRequest<any>, token: any) {
        if (token) {
            let clone: HttpRequest<any>;
            clone = request.clone({
                setHeaders: {
                    Accept: `application/json`,
                    'Content-Type': `application/json`,
                    Authorization: `Bearer ${token}`
                }
            });
            return clone;
        }

        return request;
    }
}
