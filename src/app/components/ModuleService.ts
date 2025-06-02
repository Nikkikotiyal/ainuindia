import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ModuleService {
  private _distinctModules: any[] = [];

  setDistinctModules(modules: any[]) {
    this._distinctModules = modules;
  }

  getDistinctModules(): any[] {
    return this._distinctModules;
  }
}
