import moment from 'moment';

moment.locale('ru');

export default class SSEWidget {
  constructor(url) {
    this.parentEl = document.body;
    this.bindToDOM();
    this.url = url;
    this.eventSource = new EventSource(`${this.url}/sse`);
    this.element = this.parentEl.querySelector('.sse-container');
    this.contentEl = this.element.querySelector('.sse-content');
    this.eventsId = [];
    this.regitsterEvents();
  }

  static get markup() {
    return `<div class="sse-container">
      <div class="sse-content"></div>
    </div>`;
  }

  static getEventMarkup(event) {
    return `<div class="sse-event" data-id="${event.id}">
    <div class="event-container">
      <img class="event_image" src="${event.image}">
    </div>
    <div class="event-container">
      <div class="event_date">${event.date}</div>
      <div class="event_description">${event.description}</div>
    </div>
  </div>`;
  }

  bindToDOM() {
    this.parentEl.insertAdjacentHTML('beforeend', this.constructor.markup);
  }

  drawEvents(events) {
    let HTML = '';
    events.forEach((event) => {
      HTML += SSEWidget.getEventMarkup(event);
    });
    this.contentEl.insertAdjacentHTML('beforeend', HTML);
  }

  formatEvent(e) {
    const data = JSON.parse(e.data);
    let image = '';
    if (e.event === 'freekick') image = `${this.url}/img/freekick.jpg`;
    if (e.event === 'goal') image = `${this.url}/img/goal.jpg`;
    return {
      id: e.lastEventId,
      image,
      date: moment(data.date).format('HH:mm:ss MM.DD.YYYY'),
      description: data.description,
    };
  }

  onLoadAllEventListener(evt) {
    const data = JSON.parse(evt.data);
    const events = [];
    data.forEach((e) => {
      if (!this.eventsId.includes(e.lastEventId)) {
        this.eventsId.push(e.lastEventId);
        events.push(this.formatEvent(e));
      }
    });
    this.drawEvents(events);
  }

  onLoadEvent(evt) {
    const events = [];
    if (!this.eventsId.includes(evt.lastEventId)) {
      this.eventsId.push(evt.lastEventId);
      events.push(this.formatEvent(evt));
    }
    this.drawEvents(events);
  }

  regitsterEvents() {
    this.eventSource.addEventListener('allEvent', this.onLoadAllEventListener.bind(this));
    this.eventSource.addEventListener('action', this.onLoadEvent.bind(this));
    this.eventSource.addEventListener('freekick', this.onLoadEvent.bind(this));
    this.eventSource.addEventListener('goal', this.onLoadEvent.bind(this));
  }
}
