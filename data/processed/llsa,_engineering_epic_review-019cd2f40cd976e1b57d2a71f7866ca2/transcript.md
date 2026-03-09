# LLSA, Engineering Epic Review - Mar, 09

# Transcript
**Wesley Donaldson | 00:07**
Good morning, everyone.

**Antônio Falcão Jr | 00:11**
Hello, team. Good morning.

**jeremy.campeau@llsa.com | 00:13**
Good morning. Good morning. Morning.

**Wesley Donaldson | 00:18**
All right. Let's give folks a couple more minutes to join. But I can start the board.
All right, Antonio's critical... You all are critical... How is it okay? He's pretty tucked in on what he's working on. Okay, I think we have a quorum, and let me make sure this is recorded. Yes, it is.
All right, let's jump in. Let me know if you guys can see my screen. Excellent. Okay. Good, folks. So this... I think you guys should be getting pretty comfortable with the process at this point. So this session is intended for us to basically inform our understanding and our estimation of the work and full transparency. I know this already, but I use this to help us forward target dates as well as expectations around effort and load to the larger team.
So that's to Jennifer to stay. So for this meeting, I really need you guys to voice up your concerns, and I really need you to help me true up our targets and true up our expected level of effort or complexity around individual tickets.
Okay. So for today, I'm going to do a couple of things. I'm going to walk you through what is the planned. This is a bit of high-level alignment with Stacey and Jennifer's world. Here's what we're going to tackle.
It's mostly already known. But this is for us to enrich some of those priorities. If there is a major disagreement, I want to hear it in this meeting so I can bring that back to leadership.
So for this week, the direction that we have from product is there's not going to be a lot of necessary net new features that we'll have starting of the week. We're expecting to pull one or two epics. Epics or features or core features.
So for example, we're thinking we may get couponing, discounts, but no guarantees of that. If that does come through or similar such features come through, they're probably going to be towards the end of this week.
So what we do have clear direction on is to clean up all the stuff that's left over from MVP. So much of that is already tracked as part of this effort, this epic 661. Thank you. Devin pulled together a lot with the help of your ALS pulled together a lot of small defect tickets.
I've kind of already assigned out most of these, just using the same approach that we used the last time for feedback. If you own a page, you basically get the defects related to that page. So there's a few sons already here. Jeremy, you have mostly the ones that are related to checkout, the final page and checkout right, the place order button.
Then Jiffco, you once again have a couple related to packages. Most of these are just alignment to creative from as looking at the Figma file and LANs, same idea here you have a couple. You've been taking on a few things.
So you have some maps in status. We'll talk about why that's paused or where we are with that. So you put a PR request out there. Maybe that helps solve some of that. But generally, these are the smaller tickets that we have now. Feel free to take a look.
I've put these all at roughly about it too, just because they're not new features, they're refinements. So they could be a one or two in my mind. If you disagree, please just take a look through. You don't have to do it right this moment, but I want to be bulletproof on this, ideally by the time we get to the refinement meeting this afternoon.
So just take a look through. If you disagree, if you see something that you're concerned about, please raise it up now. Overall, my thinking for this since just really bug fixing minor defects might... I'd like to target completing that for this week.
Right? So by the end of this week, I'd like to target all of this entire EPCH being completed. Pause moment... Any thoughts?

**jeremy.campeau@llsa.com | 04:34**
The one that I have paused... The back in validation... Can you open that one or... So make sure it's the one I... No, it was assigned to me and it was paused. Yes. So that one... There are a few questions and I just come up with a game plan to execute it, but I was hoping to get feedback from architecture about it.
One thing which I need to mention is and I'll just say it now, but I'll put on the ticket. Curly does have an error handling for duplicate orders.

**Wesley Donaldson | 05:08**
I which is important.

**jeremy.campeau@llsa.com | 05:09**
One of the things we need to know is... Are there duplicates there? Ideas of duplicates... The same idea of ours.

**Wesley Donaldson | 05:15**
Question, very important.

**jeremy.campeau@llsa.com | 05:16**
And does that differentiate in any way?

**Wesley Donaldson | 05:18**
Thank.

**jeremy.campeau@llsa.com | 05:19**
I'll throw it on the ticket, but like I said, I had some questions, but I put in an implementation idea and then I'll add those questions. But that one, I think depending on that, might not get done this week depending on how planning stuff out goes and stuff like that, so I just want to bring that up.

**Wesley Donaldson | 05:36**
Perfect. That's exactly what I'm looking for, Jeremy. All right, so I'm going to change this to architecture. I'll ask you to just try to boil it down to... Here the top three things I need or top two things I need. I'm sure I can get it by reading this, but just for the sake of the meeting, I'll invite you to that session, and I'll hand it to you just as a hey walk through. The needs are what the needs are for this specific ticket. That makes sense.

**jeremy.campeau@llsa.com | 06:00**
Okay, sounds good.

**Antônio Falcão Jr | 06:01**
YP.

**Wesley Donaldson | 06:02**
Just from a process perspective, we may move that out, but I'll leave it in here for now because it did stem from just that review. Okay, any other questions, any other risks that we perceive to just targeting the end of this week for this epic? Why am I always cold in the morning? Millie, taking that as a...
All right, let's keep going. So that's priority one, cleaning up all the stuff that we had left over. I have a secondary priority around just in general, cleaning up some things that have been hanging out.
I'll pause on that, and I'm actually going to ask Anth to speak towards our recurrently priority. So we have two epics that I'm contemplating pulling into this absolutely 6901, which is just the basic set up for this.
But as I said, let me hand it to Anth to just walk us through what this means. Anth, do you want to share? Do you want me to just navigate?

**Antônio Falcão Jr | 06:58**
I can share. Hey guys, good morning. Let me share my screen real quick.
I'm sure my entire screen thinks better. Miss Krisp. Okay, Tim, this is the whole year what we have to accommodate this data ingestion or ingestion. Basically, we are going to rely on Slack webhooks as a trigger as a data streaming mechanism.
So we intend to have this dedicated API gateway. Though those hooks will be triggering this specific Lambda. The work of this Lambda is to validate the token and the pool the data, the complementary data from the core.
It's important to say that those hooks are notification only, so they are not reaching information enough for us. And we are... We will be pulling this data iteration from Rick Curly and then storing this information, this raw event, in our current table right?
It's going to be a recurring raw event stream specific from this point on. The idea is to consume those events.

**jeremy.campeau@llsa.com | 08:44**
So I'll put a question in. Yes, sure, you mentioned that we're reaching out to Recurly just because the events themselves are pretty slim. That's correct. Yeah, it goes into the current. So are the events going into the current as the raw events or the events with the additional info from the enrichment?

**Antônio Falcão Jr | 09:12**
Yeah. After enrichment, we're going to store the event in the current. It's the one I call the raw event because the hooks are pretty much... Notfication. So we will not have enough information to consider that at any event.
I'm sorry if it's confused, but the idea... Okay, the idea is to be triggered by the hook and go to Recurly to hydrate to make this event more meaningful, and then store this raw but meaningful event to the current.
From this point on, we can apply a domain-driven design pattern we call a CL. The idea around a CL is just to protect to avoid linguistic boundary corruption. My point is, once Recurly is an external domain, and we don't have a way to change the terminology that is used in Recurly, we don't want a Recurly change in our terminology.
So the basic idea here is for the phase two, I would say connect to this raw event stream and pass them through an ACL, this is a CL we make a domain event. Business language translations, and things like that. We'll translate those raw events into many specific events from drive e-commerce and with this claim and boundary-specific domain event.
So we can now consume them and react to them to project information, store our projections in the Aurora as we are doing now, and then provide them via graph queries to the consumers like our centers and any other...
Right. And the same way when the user intends to express any intention or provide any mutation in our data, we're going to decide over the state from this domain events stream and motivate those specifically.
Right? I asked Claude to draw an at ML just trying to make it a better visualization. So...

**Wesley Donaldson | 11:52**
Who?

**Antônio Falcão Jr | 11:55**
It's basically the same stuff. So coming from recurring webhooks via this dedicated API gateway, this LLaMA will validate the hash signature, and we'll consume the recurring API for payload hydration.
Then placing those or storing those events could currently be a specific history for it.

**Wesley Donaldson | 12:25**
I feel like I'm...

**Antônio Falcão Jr | 12:25**
And from this.

**Wesley Donaldson | 12:26**
I don't have that one, sorry. To make sure we connect on... I don't have the web validator in there. I don't think in the epic list validate webhook, but actually, I guess 701 can cover that.

**Antônio Falcão Jr | 12:40**
It can. Yeah, the validator, I think it's more one more verbosity coming from Claude. But eventually, LLaMA will just make sure that the hook is compliant. Basically, a security lever to consume the hook, right?

**Wesley Donaldson | 12:59**
Yeah.

**jeremy.campeau@llsa.com | 13:02**
I just had a quick question about the... Was it a CL the anti-corruption layer? So I know it stands for Anti-corruption Layer, but is it really just making sure that I think you had said this?
But we're going to have language and variable names for different types of things in our system. We might have the person listed as a participant, but maybe Rick Curly has it as a user or customer.
So really that's just making sure that there's an interface in between each one and that we have it mapped correctly and stuff like that. Is that what the anti-corruption layer is? Perfect.

**Antônio Falcão Jr | 13:45**
Yeah, that's the right there.

**jeremy.campeau@llsa.com | 13:48**
Cool.

**Antônio Falcão Jr | 13:48**
They go... The goal here, yeah, is to avoid this language corruption in our modules and objects and so on. That's perfect. That's the entire idea. So we're going to consume via hooks and create this stream from the... Specific.

**Wesley Donaldson | 14:02**
One.

**Antônio Falcão Jr | 14:05**
And then we can translate this recurly specific stream in our domain specific string.

**Wesley Donaldson | 14:15**
Can you please you scroll back a little?

**Antônio Falcão Jr | 14:15**
I'm sorry, screw up.

**Wesley Donaldson | 14:18**
Yep. This is something that I wasn't aware of, so this right here, recurrently API hydration.
So we're only getting notifications... We still have to go fetch the raw data. So our webhooks don't contain raw... The actual payload data we need. It just contains some identifier for us to go pull the real information. Is that what I'm distilling from that box in the middle where your mouse is?

**Antônio Falcão Jr | 14:40**
Yeah, that's correct. The webhooks are pretty much electrification only, so we have minimal data on it, and they may not be enough for us to consider as an event. So as I could... Based on my research, what I could see is that we may need to get back to the API to recurly and gather a bit more data from specifics to create the event like order placed or order concealed, any other order paid, any other event in this nature.

**Wesley Donaldson | 15:14**
Yeah. A couple of things on this. The first one... My first thought is to open the floor to Jeremy and Lance. Have you guys, when you did the POC, run into this, or was the POC only about placing the order, not about getting the data back?
That's one question, and the other question I'd love... It's missing a ticket, but before the ticket, I'd love to hear your thoughts. And Antony, about how we deal with errors within this layer, like how do we...? Is this just going to... AD LQ? We're going to try to push an event if the events fail.
Just talk to me a little bit about... This feels like the most critical step where previously I thought the webhook was the most critical step. So just talk to me a little bit about what... Instrumenting... What do we need to do around the hydration to make sure that it can be fault tolerant?

**Antônio Falcão Jr | 16:00**
A great point. We don't have this here, but assuming that the land is the one that has the ATTTP client as well.
So all of this is part of the land. I'm sorry if the diagram is not clear enough, but yes, we're going to wrap up this work around that later queue. The idea is to use SQ as a backbone but as a resource to increase our resilience.
So we're going to try to consume obviously the webhook, and we'll try to consume the PI as well in case of any non-transient error. Eventually, we're going to push this hook to the SQs case of transit as we're going to have some retry mechanisms to try it right away and try to make it happen.
So yeah, this work must include the deadler queue and the retries in the ATTTP client level.

**Wesley Donaldson | 17:11**
If you can share this...

**jeremy.campeau@llsa.com | 17:12**
For shop of. I sorry.

**Wesley Donaldson | 17:15**
Sorry. Go ahead, Jeremy.

**jeremy.campeau@llsa.com | 17:16**
Continue. Okay, I'll go. For Shopify, we did something similar where some of the data just wasn't a part of the payload. So we did have to make an API call, and we really didn't get any errors or anything.
So, it's actually similar because you were asking about that kind of stuff. It's kind of similar to how we do a shopify. But the recurly set I when it's really worked on getting it into C Star and like handling the web book notification, so I don't really know much about that.

**Antônio Falcão Jr | 17:49**
I'm not fully familiar with the shop implementation, but based on what you describe, it is pretty much the work. Yeah, this LLaMA will... Must guarantee that we either consumed and proper storage of this event with the data hydration or we have this opportunity in the SQS to retry it later or to fix whatever we are doing wrong that's moving this to that ladder, right?

**Wesley Donaldson | 18:22**
Do you envision this as one LLaMA for the validator or one LLaMA for hydration? Or is it the same LLaMA? There are just different methods inside of it.

**Antônio Falcão Jr | 18:31**
That's a quick call. I would make the same because the validation is a very out-of-the-way simple work. It's pretty much to conflict the signature.
So it's not a big work. I would keep both these Lambdas work in the same Lambda.

**Wesley Donaldson | 18:58**
Okay, alright, that's fine. Next question from the architecture conversation we had last week, the anything that I see here.
Sorry, I'm leading the question. Do you see this as the we haven't made any meaningful change to the architecture plan from last week, or do we need to bring this. For example, talking about the hydration, the API hydration, do we need to bring that back to architecture for buy in as well?

**Antônio Falcão Jr | 19:26**
I think it's worth this revalidation for sure. Yeah, just because we're introducing a significant component, right? So I think we have to revalidate this in the architectural meeting.

**Wesley Donaldson | 19:40**
I hundred percent agree. All right, perfect. So let's do it tomorrow. So we'll have a topic out there for you to walk through the rehydration phase. Everything before this, I would still like us to pick those up if we could, because that should...
That's not going to be enough work to get us through before architecture hits anyway. But we should be able to start working through maybe the API gateway or the web validator.

**Antônio Falcão Jr | 20:05**
A great... Yeah, from the CL side guys, is everything okay?

**Wesley Donaldson | 20:05**
Great.
Okay. Anything else you want to cover here?

**Antônio Falcão Jr | 20:12**
It's pretty much... Yeah, it's quite simple, but let me know if you have further questions about this part of phase two.

**Wesley Donaldson | 20:22**
Do you want to just do a quick walkthrough?

**jeremy.campeau@llsa.com | 20:24**
Yeah, where are we getting? So we're talking about getting it into the Thrive domain model at this point. But the orders are not in C start yet. We don't have things like an order doer, a participant ID, screening information, and stuff like that.
So where's that coming from?

**Antônio Falcão Jr | 20:50**
The car part is still to be planned, if I'm mistaken, right? Was like.

**Wesley Donaldson | 20:57**
Yeah, that's base three right now or epic three right now. So I think, Lance, if you look at the Antonio... Want to pull back up the original diagram, that could just give you a rough top line.

**jeremy.campeau@llsa.com | 21:01**
He...

**Wesley Donaldson | 21:09**
If we have a little bit of time for us to plan out epic three, I expect epic three won't hit for at least maybe two weeks out. But welcome you looking at that epic. It's already a rough skeleton inside of it. We're looking at that epic, and we can talk through what specific things are needed for CSTAR.

**jeremy.campeau@llsa.com | 21:32**
I guess I mean specific for the Thrive side like if we're adding things to the domain there and we don't yet have things like a participant you what streams would we be adding?

**Antônio Falcão Jr | 21:49**
I see what you mean. I may... I think I know what you mean. So we're going to have... and work here during this phase to better specify those domain events and these linguistic needs. So it's not in place yet, but we're going to have the opportunity to work on it there. There is a specific tick to accommodate that. Does that make sense to you?

**jeremy.campeau@llsa.com | 22:15**
Okay, I think so because yeah, like it. Maybe it's just not maybe it's just a high level diagram. But I would see a lot of this happen to go into Star first and then the Thrive side reacting off of that somehow just because we don't have there's so much information missing at this point, if that makes sense.
Like, even if we pull everything out of recurrently, we're still missing a lot of stuff.

**Wesley Donaldson | 22:45**
Yeah. So the thinking was we'd just figure out what was missing as part of this epic. Then we could integrate that as part of Epic 2 and Epic 3.
But that one sentence you just said or that one phrase you just said, starting with C-Star because it has critical information that we will not have. That's the first time I'm hearing that we are phrasing it.
So maybe... Antonio, if I could ask... Maybe you and Lance could sit and pair after this meeting. I think that's more important to me. Then we can maybe share that back with Sam with your Elvis and stays to get a perspective on that because... Was a part of these conversations and he has a good understanding of C-Star versus Thrive.
So that wasn't FLA in the previous architecture, but I don't want to miss it. So maybe you guys pair after this meeting, come to a perspective you can bring back to us that we can bring into architecture or just send the states directly.

**Antônio Falcão Jr | 23:38**
Yeah, absolutely. CH.

**Wesley Donaldson | 23:41**
Okay, so let's focus on Epic one just for now. If you can go back to the Jira, please, Antonio. Or I can do that.
So the same idea I want to get a sense of the level of effort. Most of these... The D LQ I thought was pretty straightforward. It's really about the definition. We already understand that pattern, but let's... Since there's still a bit of uncertainty, I'm going to push that back up to three. Just taking a look at these tasks and again, we're missing one for the hydration.
I'll get that in there. Do we see any missing tasks here? Do we see any... Where's our schema? Validate the hook, blah. We're actually missing one for the schema discussion, so I will add that schema.
That's not how you spell that, but I get it. So I'll get that built out for us, but anything else that you're seeing that's missing here? So schema and hydration, actually.
Right. Antonio, from the last conversation we had about this, we felt that there was enough surface area for two engineers. That's including you. Do you still feel that this is enough? You're doing the ET stuff that will obviously inform this.
So we need a bit of a presentation or a walk-through from you. I'd like to just have that be the team that's mostly going to be dealing with order. I think it's basically everyone. Do you think that the Emmett work is something that we can have presented in architecture next week?
Then we can use that architecture meeting as the final kickoff.

**Antônio Falcão Jr | 25:41**
Yeah, absolutely. We can do that this week. I just need that final decision from Sam regarding projections and then we are good to either present or make a demo.

**Wesley Donaldson | 25:57**
Yeah. I'd love for us to maybe just be able to do it all in one architecture meeting and then we could invite team members like you and us. You should absolutely be part of that.
I would love to invite maybe one or two other engineers to be a part of that as well. I guess the only thing that I want to clarify is I want to pull in one or two of these for the team. Ideally, I know the end date today.
I want to get a sense of who is assigned to what. I get that you need to be a key contributor to this, but I want to be able to give at least two engineers a piece of the pie. Do you disagree with that perspective? Do we think there's enough splitting surface area available for two engineers?
I'd like one of those engineers to be like... So Lance, Jeremy, you, Elvis. Plus, I think you said you wanted... How? Jiffco? Correct me if I'm wrong there, Antonio.

**Antônio Falcão Jr | 26:51**
Yeah, that's correct. I still... I stick with this perspective that two engineers have a good scope to avoid blocking each other because there is some sequential work.
If I'm mistaken, I draw a small sequential... I will share with Thea. Just to us be able to visualize the dependency directly between those works. But yeah, and I do agree that... How would be a good guide to work on it on our side.

**Wesley Donaldson | 27:24**
Okay, Omiha is probably still dealing with some... I'll get his status and status, but he's still probably dealing with some production error resolution. Best case scenario is he'll be available starting tomorrow. Best case.
So let me give you a little bit of time to think about this. Can I ask you just to... I challenge you to be able to get at least two engineers on this, including yourself. Not including yourself. Again, my rationale for that is I want more knowledge share and I definitely want... Lance or Jeremy to be a part of this effort, just to have that connection back to CSTAR and connection back to...

**Antônio Falcão Jr | 28:06**
That makes sense. Okay.

**Wesley Donaldson | 28:08**
So you don't have to answer now, but just please put some thought into it. Let's close the loop by the end of the day today. Then the other thing I was thinking about is I'd love to get a sense of when we think it's a good target. Just looking at work, I'm thinking that's probably the end of next week would be a good target. Do you disagree and what are your thoughts generally?

**Antônio Falcão Jr | 28:30**
No, that sounds reasonable to me. Yeah.

**Wesley Donaldson | 28:33**
Okay, what would you say is the highest what's critical path here? What's the two tickets that obviously like what's the two tickets such critical path or what is the highest level of effort inside of this workstream?

**Antônio Falcão Jr | 28:48**
The highest is the LLaMA work, and we have three tickets to accommodate the lender, right? It is the dead ladder, the hydration, and then the consumption, the hooks consumption.
So those are the three.

**Wesley Donaldson | 29:11**
Okay. All right. So let's close the loop on that by the end of the day. I'm happy with that. I don't think it's a bit premature to go over 1.2 the domain-specific pipeline.
So let me just touch on some additional smaller items that are still outstanding in no particular order. So for this, some of these are actually on members from the Endor team. I don't think there's anything urgent here for this team. You, Elvis, the one that you proposed...
I think I still have it in review. I suspect we'll get a decision on that, but you already had it pushed to actually... We... Yeah, I think this is all good. We don't need to speak about this one. Let's keep going.
Okay, so this one is a bit of... I'm looking to close out some things that have ongoing issues that are pretty close. So Antonio and Jiffco, I've given. I've given two tickets to you, Antony. I already reached out to you about this.
If we can just maybe today, prioritize reviewing these and get sharing back a perspective as to where they are, if they're still warranted or not. These feel like they're just vestiges that are quite a bit old at this point, especially one that I sent to you. Jira code 312.
That's over... That's before December, it looks like. So if we can just help me close these out a little bit more. This is on end or... But I'll circle back around with you just so we close out the ticket, the epic, rather than... Else do we got?
So you all... I assigned these to you. My thinking here is they're a good opportunity just to get a sense of what specific errors exist, what specific events and monitoring exist in the backend. Me how had done the original investigation on these, I think again around the December time frame.
So if we want to... If you take a look through these and you have any questions, I'd ask you to reach out to me. How? Just to close the loop on these. Same idea looking... Just to clean out some of these things.
You, Elvis, I don't remember exactly where we left off on this one, but don't worry about it, we can touch on it in status. All right, so that's the critical priorities. Two things. One closing on three priorities. One closing on everything we had left over from MVP. Most of these are refactor tasks.
Second, we want to start working on the ingestion process for recursively so good that we have a breakout and a clarity around that. Then finally a couple of smaller tickets I shared with individual team members around closing up past reporting efforts, investigation requests for comments, just doing a little bit of cleanup.
One important thing. It's actually good that it's here. One important thing I want to talk through, it was mentioned on the call. Jennifer, I see you're here, so if you want to... I'm happy to give you the floor to speak with.
Well, I thought I wasn't here. It is not... Here we go. JENNIFER, are you still with us?

**Jennifer | 32:38**
Yeah, I'm here.

**Wesley Donaldson | 32:39**
Do you want to just speak a little to what this epic's about and the concern?

**Jennifer | 32:44**
Yeah, sure. I don't think that there's going to be very much for anybody on this team. I just had to put it somewhere. But I am going to be talking with Brian about setting up some IM users for AI processing. Michel had brought up a great point of having AI being used to look into our logs on AWS.
But I want to make sure that we're doing it safely and make sure that we're not getting any access to PII or any right access as well. So Brian and I will be setting up some of these users on a... Until then, let's not connect AI to AWS with anybody's permissions because right now I think everybody has access to the PII and I'd rather not have AI have access to that.

**Wesley Donaldson | 33:46**
Sounds good. So nothing... As you said, nothing in major for us to work on. But just be aware that it is a concern. Just to be very mindful of how AI connects to the production instances.
Okay, a little ahead of schedule, so that's good. I can go back and clean up some of the things that we learned from Antonio around the ingestion. Anyone unclear of just what the priorities for this week are? Anyone unclear of the targets?
Then more importantly, anyone disagreeing with the targets or the perceptions of efforts? Again?

**jeremy.campeau@llsa.com | 34:24**
So from the thing right...

**Wesley Donaldson | 34:25**
Go ahead. Please.

**Yoelvis | 34:30**
I think there is still some work that we need to do on the checkout process, especially when creating the orders and creating the accounts and de-duplicating. In general, we are now following... We are doing... We are doing creating some potential orphan accounts and then we are deactivating.
In general, that process is not what I would expect for production-ready. We need to give it a review. It was good for the BMVP, but now we need to give a QA review and improve that checkout process, especially the account matching and everything else that we need to do for the retries.
Yeah, and about that, something Jeremy asked is like how we plan to use the database because we need the database, for example, for the immutability and for things like that. How do we plan to use a database for some task that we need? Are we having to go through current for everything? Or can we access the relational database? What's the approach I need? I want to learn about that.

**Wesley Donaldson | 36:01**
I'm sorry, I didn't actually follow. Can you try that again, please? Are you worried about how to access information recursively relational information?

**Yoelvis | 36:12**
Now we need, for example, something that Jeremy suggested was like when you create... When you start... A checkout process, it's going to... We need to start that session in the database so we avoid errors in the same push twice.
In order to do that, we need to use a database. So I am still not clear what's the process if we need to go through current for everything or what's the...

**jeremy.campeau@llsa.com | 36:47**
Yeah, you talk about the ticket that I mentioned. I would have to go to review Wesley. That's the same ideas there that he's referencing.

**Wesley Donaldson | 36:52**
Thank you. The one that you paused. Hold on.

**Yoelvis | 37:04**
But in general, we need to do some tweaks. I don't want to explain everything here because it's a longer conversation. But for the checkout, we definitely need to take a look and do some improvements there.

**Wesley Donaldson | 37:22**
Okay, so I think that's a separate meaning unto itself. It sounds like
there are still some outstanding concerns that we need to come to terms with. All right. So let's not do that here. Let me get thirty minutes on the calendar for us to do that today because my goal would be to get those needs as part of this epic and something that we can tackle this week, right?
So I'll get 30 minutes on the calendar for early this afternoon. Maybe 01:00ish. Does that sound doable for folks? Okay, so I'm going to limit the scope of that. Jeff, I'll probably invite you to that just to get a little closer to some of the order work.
So that's Jeff, you, Elvis, Jeremy, and Lance. Does that sound good? Okay. All right, guys, thank you so much. Looks like everyone gets back a shiny six minutes and change.

**jeremy.campeau@llsa.com | 38:21**
Bye, good to see you. Thank you. Have a good one.

**Wesley Donaldson | 38:23**
Thanks, Ma. By for now.

