// Editorial illustrations: deliberately separate from the product screenshots.
(() => {
  const projects = {
    'data-lineage':['The tracer','Start at the field with the questionable value. The useful part of a lineage map is being able to follow that one thread back to its source.','Finding a match was only half the job. Search needed to show why it matched and keep its neighbours in view.','SOURCE / PATH / FIELD','<path d="M8 32h20V16h19v17h17v-9h18 M28 32v11h26" fill="none"/><g fill="#fbe166"><path d="M8 26h11v10H8zM24 10h11v11H24zM42 28h11v11H42zM76 18h12v12H76zM49 38h10v9H49z"/></g>'],
    'asset-impact-diagram':['The switchboard','A list can tell you which assets touch this one. What it hides is the shape of the dependency, and what sits one step further away.','Opening with clusters made the first view readable. People could expand the part they needed without opening every branch at once.','ASSET / CLUSTER / IMPACT','<path d="M15 28h22V11h30m-30 17h40m-40 0v15h28" fill="none"/><g fill="#fbe166"><path d="M7 21h15v14H7zM63 6h14v10H63zM74 23h13v10H74zM62 38h15v10H62z"/></g><path d="M10 25h8m58 2h7"/>'],
    'ai-workflows':['The proof sheet','Imagine receiving a whole batch of suggested descriptions. Most look reasonable. The one that overwrites someone’s careful wording is the one you need to catch.','The fast path is to accept a batch. The important escape hatch is being able to edit an exception or keep the existing description.','SUGGEST / READ / DECIDE','<path fill="#8bb99b" d="M19 12h34v33H19z"/><path fill="#fff4bc" d="M26 6h34v34H26z"/><path d="M32 14h20m-20 7h17m-17 7h10"/><path fill="#efb835" d="M53 29h26v17H53z"/><path d="m58 37 5 4 10-9" fill="none"/>'],
    'mm-crm':['The call sheet','It’s the start of a loan officer’s day. The borrower’s name is in a spreadsheet. Their last conversation and the next action need to be right beside it.','Bringing notes, calls and follow-ups into one record let a loan officer act while the conversation was still in front of them.','LEAD / CALL / FOLLOW UP','<path fill="#fff4bc" d="M12 12h43v31H12z"/><path d="M17 18h26m-26 8h12m4 0h16m-32 8h22"/><path fill="#efb835" d="m56 10 9 2-2 8-4 3 4 6 6 4 5-4 8 5-4 7-8 1-12-9-8-12z"/>'],
    'bdo-onboarding':['The passbook','Picture an applicant ready to open an account. Whether they already bank with BDO changes which information the bank needs to ask for.','The experience had to work for existing customers, new customers and branch staff. The point was to ask for the right information on each path.','APPLICANT / CHECK / ACCOUNT','<path fill="#d8bb59" d="m8 21 21-13 21 13zm5 1h32v4H13zm3 6h5v12h-5zm10 0h5v12h-5zm10 0h5v12h-5zM10 41h38v4H10z"/><path fill="#fff4bc" d="M56 8h23v38H56z"/><path fill="#87ba85" d="M60 14h15v21H60z"/><path d="m62 24 4 4 6-8m-8 21h6" fill="none"/>']
  };
  class FieldNote extends HTMLElement {
    static get observedAttributes(){return ['place','mode'];}
    connectedCallback(){this.draw();}
    attributeChangedCallback(){if(this.isConnected)this.draw();}
    draw(){if(this.closest('x-dc'))return;const item=projects[this.getAttribute('place')];if(!item){this.replaceChildren();return;}
      const end=this.getAttribute('mode')==='closing';
      const stamp='<div class="print-block" aria-hidden="true"><svg viewBox="0 0 96 54" shape-rendering="crispEdges"><g stroke="#173f31" stroke-width="2">'+item[4]+'</g></svg></div>';
      this.innerHTML=this.getAttribute('mode')==='stamp'?stamp+'<small>'+item[3]+'</small>':stamp+'<div><small>'+(end?'LOOKING BACK':'FROM MY NOTEBOOK')+' / '+item[3]+'</small><strong>'+item[0]+'</strong><p>'+item[end?2:1]+'</p></div>';
    }
  }
  customElements.define('field-note',FieldNote);
  const trailNotes={
    'data-lineage':{'Four customers, one test drive':['The test bench','Watch what happens when four customers try the same tasks on the same map.'],'Try it yourself':['At the controls','Try both arrangements. Notice which controls stay in reach while you explore the canvas.']},
    'asset-impact-diagram':{'Understanding the workflow first':['At the junction','Start with one asset. How far out does someone need to look before they can judge the impact of a change?'],'What shipped':['Open a cluster','The first view groups related assets. The next move belongs to the person exploring.']},
    'ai-workflows':{'Generating and reviewing AI descriptions':['At the review desk','Read this as the steward who already wrote a description. What should happen to your words when AI proposes new ones?'],'Recommending and reviewing business-term links':['Before the save','A suggested connection is still only a suggestion. Look for the moment the steward makes it real.']},
    'mm-crm':{'Understanding the workflow first':['At the loan officer’s desk','Follow a lead from the first conversation to the follow-up. Where does the officer have to leave the record?'],'What shipped':['Make the call','Look for the call log beside the phone action. The history of a conversation is right where the next one starts.']},
    'bdo-onboarding':{'Understanding the workflow first':['At the entrance','A returning customer and a first-time applicant arrive with different histories. Where should their paths separate?'],'What shipped':['Beyond the counter','Follow the account-opening flow as an applicant who never sets foot in a branch.']}
  };
  class FieldMarker extends HTMLElement{
    static get observedAttributes(){return ['place','topic'];}
    connectedCallback(){this.draw();}
    attributeChangedCallback(){if(this.isConnected)this.draw();}
    draw(){if(this.closest('x-dc'))return;const key=this.getAttribute('place'),note=trailNotes[key]?.[this.getAttribute('topic')];if(!note){this.replaceChildren();return;}
      this.innerHTML='<div class="trail-print" aria-hidden="true"><svg viewBox="0 0 96 54" shape-rendering="crispEdges"><g stroke="#194a35" stroke-width="2">'+projects[key][4]+'</g></svg><img src="./assets/signal/walker.svg" alt=""></div><div><small>ON THE TRAIL</small><strong>'+note[0]+'</strong><p>'+note[1]+'</p></div>';
    }
  }
  customElements.define('field-marker',FieldMarker);
})();
