import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'DMS AINU';
}




// import { Component, OnInit } from '@angular/core';
// import { ApiService } from './api.service';

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   template: `
//     <h1>{{ message }}</h1>
//   `
// })
// export class AppComponent implements OnInit {
//   message = '';

//   constructor(private apiService: ApiService) { }

//   ngOnInit() {
//     this.apiService.getTestMessage().subscribe(data => {
//       this.message = data.message;
//     });
//   }
// }
