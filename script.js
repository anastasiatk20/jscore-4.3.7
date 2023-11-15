class View {
  constructor () {
    this.app = document.getElementById('app');

    this.block = this.createElement('div', 'block');

    this.blockInput = this.createElement('input', 'block__input');
    this.block.append(this.blockInput);

    this.blockNoFound = this.createElement('span', 'block__noFoundStr')
    this.blockNoFound.textContent = `No found`;
    this.blockNoFound.style.display = 'none';
    this.block.append(this.blockNoFound)

    this.blockError = this.createElement('span', 'block__ErrText')
    this.blockError.style.display = `none`;
    this.block.append(this.blockError);

    this.blockPeopleList = this.createElement('ul', 'block__peopleList');
    this.block.append(this.blockPeopleList);

    this.blockSelectedRepoList = this.createElement('ul', 'block__selectedRepoList');
    this.block.append(this.blockSelectedRepoList)

    this.app.append(this.block);

  }

  createElement(elemTag, elemClass){
    const element = document.createElement(elemTag);
    if (elemClass) element.classList.add(elemClass);
    return element;
  }

  createUser(user, obj) {
    const userElement = this.createElement('li', 'block__listItem');
    const button = this.createElement('button', 'block__ListBtn');
    button.setAttribute('data-user-info', obj);
    button.textContent = user.name;
    userElement.appendChild(button);
    this.blockPeopleList.appendChild(userElement);
  }
  
  createSelectedUser(selectedItem) {
    this.blockInput.value = '';
    this.blockPeopleList.textContent = '';
  
    const obj = JSON.parse(selectedItem.getAttribute('data-user-info'));
    const userElement = this.createElement('li', 'block__selectedItem');
    const selectedInfo = this.createElement('div', 'block__selectedInfo');
    selectedInfo.innerHTML = `
      <p>Name: ${obj.name}</p>
      <p>Owner: ${obj.Owner}</p>
      <p>Stars: ${obj.Stars}</p>
    `;
    const deleteBtnWrapper = this.createElement('div', 'block__deleteBtnWrapper');
    const deleteBtn = this.createElement('button', 'block__deleteBtn');
    deleteBtnWrapper.appendChild(deleteBtn);
    userElement.appendChild(selectedInfo);
    userElement.appendChild(deleteBtnWrapper);
    this.blockSelectedRepoList.appendChild(userElement);
  
    if (this.blockSelectedRepoList.children.length > 3) {
      this.blockSelectedRepoList.style.overflowY = 'scroll';
    }
  }

  removeSelectedUser (elem) {
    if(elem.tagName == 'BUTTON') this.blockSelectedRepoList.removeChild(elem.offsetParent.parentNode);
    if (this.blockSelectedRepoList.children.length <= 3) this.blockSelectedRepoList.style.overflowY = 'visible';
  }

}

const USER_PER_PAGE = 5;

class Search {
  constructor(view) {
    this.view = view;
    this.debounceTime = 500;

    this.view.blockInput.addEventListener('input', this.debounce(this.loadUsers, this.debounceTime).bind(this));
    this.view.blockPeopleList.addEventListener('click', (e) => this.view.createSelectedUser(e.target));
    this.view.blockSelectedRepoList.addEventListener('click', (e) => this.view.removeSelectedUser(e.target));
  }

  async loadUsers() {
    const inputValue = this.view.blockInput.value.trim();

    if (inputValue !== '') {
      this.view.blockNoFound.style.display = 'none';
      this.clearUsers();

      try {
        const response = await fetch(`https://api.github.com/search/repositories?q=${inputValue}&per_page=${USER_PER_PAGE}`);

        if (response.ok) {
          this.view.blockError.style.display = 'none';
          const data = await response.json();

          data.items.forEach((elem) => {
            this.view.createUser(elem, JSON.stringify({
              name: elem.name,
              Owner: elem.owner.login,
              Stars: elem.stargazers_count,
            }));
          });

          if (this.view.blockPeopleList.children.length === 0) {
            this.view.blockNoFound.style.display = 'block';
          }
        } else {
          throw response;
        }
      } catch (err) {
        console.log(err);
        this.view.blockError.style.display = 'block';
        this.view.blockError.textContent = `${err.status}. \n Something was wrong. Please, try it later`;
      }
    } else {
      this.clearUsers();
    }
  }

  clearUsers() {
    this.view.blockPeopleList.textContent = '';
  }

  debounce = (fn, debounceTime) => {
    let timeout;

    return function () {
      const fnCall = () => {
        fn.apply(this, arguments);
      };
      clearTimeout(timeout);
      timeout = setTimeout(fnCall, debounceTime);
    };
  };
}

new Search(new View());
