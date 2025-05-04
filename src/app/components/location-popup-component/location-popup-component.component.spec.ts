import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationPopupComponentComponent } from './location-popup-component.component';

describe('LocationPopupComponentComponent', () => {
  let component: LocationPopupComponentComponent;
  let fixture: ComponentFixture<LocationPopupComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationPopupComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LocationPopupComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
