'use strict'

var app = app || {}

app.ItemView = Backbone.View.extend({

  tagName: 'tr',

  template: _.template( $('#item-template').html() ),

  events: {
    'click .btn': 'click'
  },

  initialize: function(){
    
    this.listenTo( this.model, 'change', this.render )
    this.listenTo( this.model, 'destroy', this.remove )
    this.listenTo( this.model, 'appendShortcut', this.appendShortcut )
    this.listenTo( this.model, 'saveShortcut', this.saveShortcut )
  },

  render: function(){

    this.$el.html( this.template(this.model.toJSON()) )
    this.$el.toggleClass('selected', this.model.get('selected'))

    // Reverse alt input and normal input if we are on alt rec type
    //this.$input = this.$('.in');
    //this.$altIn = this.$('.altIn');
    var onRec = this.model.get('recording')
    if( onRec ){
      this.$recBtn = this.$('#' + onRec)
    }else{
      this.$recBtn = this.$('.in')
    }

    var state = this.model.get('state')
    if( 
      state !== undefined &&
      this.$recBtn.length > 0 &&
      state === STATES.REC
    ){
      this.$recBtn.removeClass('btn-default')
      this.$recBtn.addClass('btn-danger')
      this.$recBtn.text('...')
    }

    return this
  },

  appendShortcut: function( key, event ){
    //console.log('appendShortcut', key);
    // Validate shortcut, 
    // if we are on an internal app shortcut will come from a button,
    // else it'll come from an input text
    // on button input we allow meta keys, on input text we do not
    // also, as text input handles adding data itself, no need to do anything
    if( key !== null ){
      if( this.model.get('type') === '_system_' ){
        event.preventDefault()
        var prev = this.$recBtn.text().trim()
        if( prev.indexOf( key ) === -1 ){
          // Only append if we not present on shortcut
          this.$recBtn.text( ((prev !== '' && prev !== '...')?prev + ' + ':'') + key )
        }
      }else if( event.which === ENTER_KEY || event.which === ESCAPE_KEY ){
        // Exit rec
        event.preventDefault()
        if( event.which === ENTER_KEY ){
          this.model.trigger('saveShortcut')
        }
        this.model.set({ state: STATES.IDLE, recording: null })
      }
    }
  },

  saveShortcut: function(){

    let toSave = this.model.extract()
    let opts = {
      patch: true,
      wait: true,
      data: { req: '' }
    }
    let saveValue = this.$recBtn.text() || this.$recBtn.val()
    let type = this.getRecType()

    if( type === 'normal' ){
      toSave['scut'] = saveValue
      opts.data.req = 'changeAppShortcut'
    }else{
      toSave['location'] = saveValue
      opts.data.req = 'changeAppLocation'
    }

    opts.data.data = toSave

    this.model.save( toSave, opts )
  },

  getRecType: function(){
    if( this.$recBtn.attr('id') === ('btn-' + this.model.get('id')) ){
      return 'normal'
    }else{
      return 'alt'
    }
  },

  click: function( event ){

    // Unselect previous recording view
    function unselect(){

      var sel = app.Items.selected()
      
      if( sel ){
        sel.set({ selected: false, state: STATES.IDLE })
        app.STATE = STATES.IDLE
      }
    }

    if( this.$('.in').attr('id') === event.target.id || this.$('.altIn').attr('id') === event.target.id ){
      
      unselect()
      
      if( this.$('.in').attr('id') === event.target.id ){
        this.$recBtn = this.$('.in')
      }else{
        this.$recBtn = this.$('.altIn')
      }

      if( app.STATE === STATES.IDLE ){
        var btnId = this.$recBtn.attr('id')
        this.model.set({ selected: true, state: STATES.REC, 'recording': btnId })
      
        if( this.model.get('type') !== '_system_' ){
          this.$recBtn.replaceWith($('<input/>', {
            "type": 'text',
            'placeholder': 'Shortcut',
            'id': this.$recBtn.attr('id'),
            'class': this.$recBtn.attr('class')
          }));
          this.$recBtn = this.$('#' + btnId)
          this.$recBtn.focus()
        }
      }else if( this.model.get('type') === '_system_' ){
        this.model.set({ state: STATES.IDLE, recording: null })
      }
    }
  },

  clear: function(){
    this.model.destroy()
  }
})