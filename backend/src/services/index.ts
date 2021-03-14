import { Application } from '../declarations'
import users from './users/users.service'
import books from './books/books.service'
import media from './media/media.service'
import progress from './progress/progress.service'
import search from './search/search.service';
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
  app.configure(users)
  app.configure(books)
  app.configure(media)
  app.configure(progress)
  app.configure(search);
}
