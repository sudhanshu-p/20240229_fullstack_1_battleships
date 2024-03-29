import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainGamePageComponent } from './main-game-page.component';

describe('MainGamePageComponent', () => {
  let component: MainGamePageComponent;
  let fixture: ComponentFixture<MainGamePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainGamePageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MainGamePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
