import css from './App.module.css';
import { Component } from 'react';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { fetchPictures } from 'services/ApiService';
import { Searchbar, ImageGallery, Button } from 'components';

export class App extends Component {

  state = {
    images: [],
    query: '',
    page: 0,
    lastPage: 0,
    status: 'idle',
  }

  async componentDidUpdate(_, prevState) {

    const { query, page } = this.state;

    if (prevState.page !== page && page !== 1) {

      try {
        const response = await fetchPictures(query, page);
        this.setState(({images}) => ({ images: [...images, ...response.hits], status: 'resolved' }));
        setTimeout(() => this.scroll(), 100);

        } catch (error) {
        this.setState({ status: 'rejected' });
        console.log(error.message);
      }      
      
    }
  }

  handleSubmit = async (event) => {
    event.preventDefault();

    const newQuery = event.target.elements.input.value.trim();
    const page = 1;

    if (newQuery === "") {
      return Notify.warning('Search field is empty. Please, enter your request');
    }
    
    this.setState({ query: newQuery, page: 1, images: [], status: 'pending' });
    
    try {
      const response = await fetchPictures(newQuery, page);
      const { totalHits, hits } = response;

        if (totalHits === 0) {
          this.setState({ lastPage: 1, status: 'rejected' });
          Notify.failure('Sorry, there are no images matching your search request. Please try another request.');
          return;
      }
      
      const lastPage = Math.ceil(totalHits / 12);
      this.setState({ lastPage, images: hits, status: 'resolved' });
      Notify.success(`Hurray! ${totalHits} images found`);

        } catch (error) {
        this.setState({ status: 'rejected' });
        console.log(error.message);
    }     
  }
  
  handleBtnClick = () => {
    this.setState(prevState => ({ page: prevState.page + 1, }));
  }

  scroll = () => {
    const { clientHeight } = document.documentElement;
    window.scrollBy({
      top: clientHeight - 180,
      behavior: 'smooth',
    });
  };

  render() {

    const { images, page, lastPage, status } = this.state;
    return (
      <div className={css.App}>
        <Searchbar onSubmit={this.handleSubmit} isSubmitting={status === 'pending'}/>
        <main>
          {status === 'pending' && <p>LOADING.....</p>}
          {status === 'resolved' && <ImageGallery images={images} />}
          {page !== lastPage && <Button onClick={this.handleBtnClick} />}
        </main>
      </div>
  )}
};
