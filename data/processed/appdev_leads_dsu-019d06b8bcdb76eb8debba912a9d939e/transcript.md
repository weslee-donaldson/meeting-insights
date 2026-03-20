# AppDev Leads DSU - Mar, 19

# Transcript
**bethany.duffy@llsa.com | 00:38**
Three.

**Wesley Donaldson | 00:43**
Moving. Ols.

**bethany.duffy@llsa.com | 01:52**
Let's you...
When I kick us off...

**Wesley Donaldson | 01:58**
Sure. Not a problem. Show my screen.
You guys can see this. Okay, you guys have on-screen. Okay, cool. All right, so... How is it? I think we're at the last step, the final hurdle to close out this replay events. So we're running the last 1200ish this morning. Ray, we expect to be completed with that if... Not already posted, probably within an hour or so, we should be closed out on this.
I think there's one additional task for Jennifer to do just to follow up on this. But once that is done, we can close out this task with the P ones out of the way. Just going from right to left. I'm not going to touch on the ones that we already moved down.
I think I've touched on most of these, actually. No apologies. One item from yesterday that we had in PR that we were able to move to done is actually the hydration of events coming over via the webhook from Recurly.
So Antonio has finished the ACL, and this reminder is the ACL part of that is just pulling all the data for the events from the webhook, pulling that from Recurly, and pushing that into current. So that has been completed, reviewed, and... That's fully functional in the experience now. Just in general, keep in mind that things that are flagged as purple are things that we have tested from a unit test perspective, but not green until it's actually been fully end-to-end tested, including data coming from the core of currently... My good progress overall on that keeping us going. We had a few tickets from Miha yesterday that were in review. Some of those still remain in review, but we've made some good progress. We've moved a few things into Confluence, for example, the post-mortem information that has been moved into Confluence to live where it normally lives. I reviewed that, so I think I'm comfortable marking that it's completed.
I'll share the specific URL with Jennifer so she can have a chance to review as well. We had Harry... Specifically, thank you for taking a quick pass at the playbook. I think probably a little bit more conversation is needed on there, but I've moved that into Confluence as well for us to be able to have one area, maybe one playbook that all team members can follow across Andor and Mandalor.
So that's progressing... I moved the code sweep. So the code sweep for us to remember from the blue-green issues that we identified, we wanted to do a review of all switching logic to see if they used the same approach.
So we completed that. He created a very detailed summary part of the PR that basically proves to us that... Proves us that we don't have that same bug in any additional systems. We have some good...

**bethany.duffy@llsa.com | 04:50**
Good news.

**Wesley Donaldson | 04:51**
Go ahead, right?

**harry.dennen@llsa.com | 04:53**
Good news.

**Wesley Donaldson | 04:55**
I mean, take a look at the PR he documented out the five different approaches he used to do that verification. If we think that doesn't fully cover us, it may be worth a conversation, but it looked pretty good. It looked very detailed.

**harry.dennen@llsa.com | 05:07**
Okay, that's a draft. Is he trying to merge that now or...?

**Wesley Donaldson | 05:10**
He should have already merged.
I'll sync back with him on that merge.

**harry.dennen@llsa.com | 05:12**
I see it now. I'm looking at a stale thing. Yeah, I see it.

**Wesley Donaldson | 05:15**
Okay. One important ticket that we talked about a while back. I think it's important for us to... Is in good standing now. It's around how we're actually doing our PR environment deployments.
So whenever an engineer creates a deployment now... Sorry, I am not seeing this. There we go, sorry, looking right at me. This ticket's super important for us to be aware of. Definitely looking to see that pattern we can have across two teams as well. The idea behind this ticket is rather than just always creating a PR environment and all the resources associated with that, we now have the ability to have an engineer explicitly ask for a deployed PR environment. How will we be demonstrating that as part of our Fridays to get folks on and still probably holding onto this a little while so we have a little more rounds of feedback.
To answer the question, is this going to block anything that we're doing for recurring? Good progress. Just how can we reduce some of the usage of resources? This one I think we've already touched on.
It's in good standing. Just waiting for some reviews on it. So overall, I think the team's making good progress. One item that maybe Antonio and I may have talked about a little bit faster, but I think we're doing really good on is the webhook processing. There's a very detailed PR that was put out by Lance and Tony provided four good points that he's pairing with Lance on to actually resolve.
So we're expecting this should be out of PR today. If with this out of PR, we would actually be at a position where our... If you look at our integration document, we would effectively have purples, which means unit-tested features working. It just needs to be proven.
So we would have purples across all of the board, which means all of this code has been written and tested in the engineering sand and is just waiting for a full integration test. For our integration test, I pulled in a ticket.
I've created a ticket for an effort around it for Antonio. Just to use the work that we did for Playwright to actually trace some automated mechanism for us to create orders and be able to quickly run things through the flow in different scenarios to facilitate more rapid testing.
So he's working on that today into tomorrow, expecting to have that for Friday. Sorry for Monday. Just looking at the runway we have left. We're targeting as a team to have all of the functionality tested and blessed for the injection for the consumption of events from recurry completed by mid to end of... Latest tomorrow, and then targeting the completion by Ed to mid of day on Wednesday to have all of the back-end work completed as well. This work is still very much in process on the board.
If we were to look at Jeremy Lance, Jeremy specifically is still in progress, but there's high confidence from Jeremy that he understands the critical task, the critical path, which is the mapping activity as well as how we're actually going to make updates to the existing e-com that our new version of the e-com to Data API.
So all of the Azure work, the pipeline work. Francis completed the pipeline work actually this morning just now, or rather he hasn't in review. So we actually have high confidence right now that this work will be available. Will be completed targeting mid next week.
I'm actively keeping an eye on this, working with Army to make sure we were clear on when we're expecting to have this. But overall, if I use this as... Where's our status? Feeling really good here. We have a plan of attack, team members are tucked in, actively working. There are no blockers or unknowns at this point. The big unknown around the mapping got to a really good place based on some conversation with Jennifer and a team working through that. Feeling positive about targeting mid next week to be completed with all of the ingestion and processing and then pushing that into C-Star. I can go over more detail, but I think that's the critical elements this team needs. Let me pause there and ask if any questions.

**harry.dennen@llsa.com | 09:28**
Two.

**Wesley Donaldson | 09:31**
Okay. Stays... Anything you that I missed that you need some transparency on.

**Speaker 4 | 09:40**
I think I'm good at the moment. I may have some follow-up and refinement this afternoon.

**Wesley Donaldson | 09:48**
Thanks a.

**harry.dennen@llsa.com | 09:57**
I should be pretty quick. Those cognitive conditions for ensuring an account is created... There's a little bit of extra complexity there with regard to the initial sync events that happened around the property, specific ones like "email updated" and "phone updated" and just the general update.
So I spent more time with Dane going through that and figuring out our simple way. I think fundamentally the way the system or events or systems are meant to work is that you have an event and then you must decide what to do with it, rather than being given an event and then doing something specifically based on that event.
I think the Emmett decider pattern should help us with that. I think we have a little bit of debt here that we need to deal with. So there are a few extra stories coming out of this around... We have an epic.
It's not called debt, but it's effectively that. So the goal is this needs to go in today so we can get fully onto the status update stuff. I haven't made the progress I wanted to yesterday on that, but it is moving slowly. The test coverage for the admin portal is moving along. One area is done, the next is the search participant stuff which is moving. There is a blocker on some of the NN stuff and that's specifically around the VPN test environment issues we are still having, which is blocking the internal gateway step for the admin portal.
So that is still sitting with infrastructure. Nothing has changed according to Francis. The finally getting rid of the yellow banner should be happy about that. So... and I'll show that in the call today. Product DJ's moved on to the membership status stuff. He's getting the moving parts in place, with test triggers.
Wes was saying that ultimately it's going to be with Mandalor to create the event bridge I to say call to actually trigger that. And he turned off auto membership renewal last week because that is apparently being handled by Recurly.
So we probably just want to verify that that's actually happening. I know it hasn't. We haven't moved over to Krisp yet, but it's definitely off in Legacy, so the auto membership renewal needs to be... Somebody has to have eyes on it.
Then if somebody can give me... Yeah, what's up?

**Wesley Donaldson | 12:36**
On the auto membership renewal. Memberships that are and apologies, maybe I'm just missing something in the architecture here, but memberships that are that were originally created before RICKCUURLY those how are how would Rick Curly and entry and Rick Curly be responsible for doing their renewals?

**harry.dennen@llsa.com | 12:58**
I don't know if it's accounted for. This isn't...

**bethany.duffy@llsa.com | 13:02**
We are migrating our memberships out of our legacy membership application into Recurly so Recurly can start doing the auto renewals on them. Lest how this links into the webhooks that are happening.
It's the same data that's getting pulled for the orders that we need to pull for the membership renewals. So we were waiting until we had the webhooks all figured out for the orders.

**Wesley Donaldson | 13:25**
For our conversation. Yes. Okay. Makes sense.

**harry.dennen@llsa.com | 13:30**
Okay, cool. On DJ's time we've got prod support stuff coming in which Berman is going to pick up once he's got this, but it is pulling it, DJ a bit. Then there's the Ray I see that the colonoscopy stuff is finally ready and that's come in. What is the priority between the colonoscopy questions and the membership status stuff for DJ?
Like, which does he need to finish first? Because right now he's trying to do all three and that's not going to go well.

**Speaker 4 | 14:14**
I'd say let's just knock out that colonoscopy question and ask a question, get it out of our way so that when the data is ready to present to MMA he's got nothing else to say.

**harry.dennen@llsa.com | 14:24**
All right, cool. So I'll put this...

**Speaker 4 | 14:26**
Is that track with the product? Yeah, okay.

**harry.dennen@llsa.com | 14:32**
All right, cool. I'll let him know.

**Speaker 4 | 14:33**
Everyone's excited about this colonoscopy thing, so if we get it off our backs, we'll be better off.

**harry.dennen@llsa.com | 14:38**
I mean, what's not to be excited about colonoscopies? Right? Joke. So, I think that's everything. Nick has started on the... I'm trying to say membership, but that's not that. Status management updates, and that's it for us.

**Jennifer | 15:19**
I just hopped on. Did you guys both give status updates? Okay.
Is there anything else that anyone has? Otherwise, I'll just read over the transcript and message if I have any other questions.

**harry.dennen@llsa.com | 15:48**
I don't think so. Awesome, thank you bye.

