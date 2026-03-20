# Mandalore, EOD State of Integration - Mar, 19

# Transcript
**Wesley Donaldson | 00:07**
This will be quick.
That's not the right meeting.

**Speaker 2 | 00:20**
No.

**Wesley Donaldson | 00:22**
And Malan Newt, how goes the day?

**jeremy.campeau@llsa.com | 00:23**
Hey.

**Wesley Donaldson | 00:36**
Yeah, so it was the end of the day.

**Speaker 2 | 00:36**
It's almost...

**lance.fallon@llsa.com | 00:37**
Yeah.

**Wesley Donaldson | 00:39**
My yeah, I come on, say more than that.

**Speaker 2 | 00:39**
It's almost Friday, right?

**Wesley Donaldson | 00:43**
It's almost Friday, and I think we've accomplished quite a lot this week, so I actually... Very good about...

**Speaker 2 | 00:47**
That's true. That's true.

**Wesley Donaldson | 00:51**
Well, I'd love Antonio to join this in just a minute. Can you join? Okay, so I'll just set this up. This meeting should be fast. Let's... I'm trying to see if I can get you guys out of here in five minutes.
I just want to keep this on the calendar. My hope and goal here... Antonio's aware of this, but my goal with this meeting is just... There's a lot of eyes on how we're progressing through the work, and there's literally additional work that's dependent on how far we make it. A great example of that is we had a good conversation about architecture today around how we're supporting subscriptions from legacy pre-recursively, and how we, as a Mandalor team, are going to pick up some tickets relative to that. Just my point there is that even what we're currently aware of, there are still other things for us to get to that goal of getting to production by the end of March.
I think we're marching really well towards that. Just to restate that statement. So my hope for this meeting is just... Let's all get together, touch on really quickly where we are with the state of integration, and then... There's absolutely got to be some stuff that's not quite there or needs an additional conversation, call it out. Don't worry about ticketing.
I'll figure I'll get you whatever you need from a ticketing. I'll hunt down whatever meetings we need, but I just want us to have an opportunity to sync and be on the same page. So if I'm representing something that's not 100% accurate, this is my chance to learn. Be corrected if you are.
Like, for example, Antonio, we've all like we talked about doing a job that would allow us to pull all of the playwright scripts into one unified script, to be able to run multiple orders quickly through the system and trigger different conditions.
Kind of like downstream. I don't think everyone's aware of that. That's a that's kind of what I'm hoping for this meeting, a place for us to just to sync on things like that we're doing to facilitate the success of this like this integration effort. Does that make sense?

**Speaker 5 | 02:51**
Yeah, it.

**Wesley Donaldson | 02:53**
Okay. So my understanding is... So just so you guys are aware of what these colorful things mean. Red basically is anything that we haven't touched, we're not aware of, or it's outside of our realm of control. Blue stuff that we're working on, so we know what these things are. Things that are purple or whatever their color is, are things that we have APR, we have some kind of unit coverage on.
Either we've completed the feature or we've written tests for it. We have a good understanding of what the functionality is. Then green is it's all done. So you'll notice that with Jira code completing the CDK work and the DAL Q those are flagged as green, but their connectors are not.
The idea here is that the connector is where the integration happens. So we have to prove out that we can actually push something on the SQS. It failed, and it got dropped in the Lq. We have to prove out that some notification gets pushed to teams. It shows up on a dashboard somewhere.
So there's still stuff for us to do, even though you... Have completed the CDK work around like the API gateway and some other tools. See what I'm saying? So that stuff is not necessarily super easy to represent on a go board.
I'm hoping this meaning in the play can be the place where we... It's intentional that it's just the folks doing the work are part of this conversation. It's intentional. It's a place for us to... No, this needs a ticket because it's more complicated.
So with that being said, any initial thoughts or questions like, "Hey, I don't find this useful." Feel free to say it. I don't want to get in the way. I want to find a way to make us be successful.

**Speaker 5 | 04:30**
The. Yeah. The web hoop level got just merged. So maybe we can upedate it to green a man.

**Wesley Donaldson | 04:36**
That should be so sorry you said mergers and merge on Maine.

**Speaker 5 | 04:41**
Yeah? Who?

**Wesley Donaldson | 04:42**
Yeah, that's gen then. Yeah, look, that alone made me happy to keep this meeting, so that's great.
So then effectively then we have everything from pushing an order to recursively. We got the lambda, we got the hydration and the... Well, this couldn't have gotten it without the SQ S. So we are effectively unit complete on getting information into current.
So then Antonio, what we talked about this morning is going to be even more present now because we need to be able to prove and push multiple things through the system. I think my question to you would be, "How do we figure out how to trigger the D LQ? How do we trigger specific, negative cases through the flow?"

**lance.fallon@llsa.com | 05:20**
Yes, real quick. Maybe it's mentioned on here, but the API gateway still needs a custom domain that we're going to have to set up.

**Wesley Donaldson | 05:28**
But no, like, I don't think I'm aware of that.

**lance.fallon@llsa.com | 05:32**
I don't think that's been completed.

**Wesley Donaldson | 05:36**
I don't think I have that one. We have like a we have a basic infrastructure for the API gateway.
But I don't have a specific rule for as I see you go, you know, you com there.

**lance.fallon@llsa.com | 05:42**
So yeah, there's the e-com one, but the API gateway that recur is going to hit for the lender. Yeah, so I know it's dubbed out, but we're out.

**Speaker 2 | 05:58**
That's correct. I put a note here. If you guys look at it at Krisp, plus SK plus DLQ still need production setup. That includes the custom domains for blue and green. That includes the cloud front, the SSLs, everything here.
So that's a separate work cut.

**Wesley Donaldson | 06:18**
Next perfect. That's exactly what I need. So thank you for that. All right, so I'll get us that, and I'll get Francis to join these calls so he has transparency, that kind of stuff as well.
Okay. So we need an API gateway. His name is on this. So let's get that there, first of all.

**Speaker 5 | 06:36**
Between the recurrly and the webhook component. Yeah, you can place the Pi right there. Good.

**Wesley Donaldson | 06:43**
I'll make it look pretty later. This, we have the gateway, but we don't have the interaction between it, so actually, no, we don't even have that fully because we are missing the DNSs.

**lance.fallon@llsa.com | 06:57**
If you've tested it with the raw URL and it's functional, we just don't have the custom domain.

**Wesley Donaldson | 07:04**
Sorry, my yard is being cut. One more time, please.

**lance.fallon@llsa.com | 07:08**
I tested it with the raw URL for the gate and it's functional. We just don't have the custom domain.

**Wesley Donaldson | 07:15**
Okay. Perfect. So then this is actually... Or purple because we've tested it. Okay, so we'll get you the custom domain name. Let's just call it infra.

**Yoelvis | 07:29**
Why do we need the domain stuff for the blue-green?

**Wesley Donaldson | 07:33**
When we need some X's point for redundancy to hit, and I can't give an ID, we did not...

**Speaker 2 | 07:35**
And for the record, yeah, for the yeah.

**Yoelvis | 07:38**
Yeah, but API gateway is deploying it's deploying into an API. It's not pretty, but it doesn't have to be pretty for recording because it's not user-facing.

**Wesley Donaldson | 07:49**
That's a fair point.

**Speaker 2 | 07:51**
It's not pretty, man. It's not pretty.

**Wesley Donaldson | 07:53**
He's right.

**Yoelvis | 07:53**
I know it's not pretty, and my point is it doesn't have to be pretty for recording.

**Wesley Donaldson | 07:54**
I think the real question is the real question what security do we have on the gateway?

**Yoelvis | 07:58**
It's business to business. It's no, it's not a customer facing.

**Wesley Donaldson | 08:07**
Like are we doing any kind of point to point like only accepting from recurrly? I think the domain name is a conversation.
But you're absolutely right. You, all of us. Maybe it doesn't need to be pretty, but is there anything else there that we're missing? Like a like additional security?

**Yoelvis | 08:25**
The API one is good. The only advantage I see by using route 53 with a domain and things like that is for the probably for the blue-green deployment configuration, is that correct?

**Speaker 2 | 08:45**
I think even for the blue-green, we can use the... Well, no, because we cannot change them. Yeah, for production at least, we will need the blue-green custom domain name.

**Speaker 5 | 08:57**
Yeah.

**Wesley Donaldson | 08:57**
Okay, so that's...

**Yoelvis | 09:00**
So that's a good point.

**Wesley Donaldson | 09:00**
So then we have no choice.

**Yoelvis | 09:01**
But other than that, it's not like it's not a problem with the domain name. Because when you configure those webhooks business to business, you don't... We don't need to care too much about the domain.

**Speaker 2 | 09:17**
Yeah, but don't you like beautiful things? [Laughter].

**Yoelvis | 09:20**
All right, that's a good point. [Laughter].

**lance.fallon@llsa.com | 09:22**
I...

**Wesley Donaldson | 09:22**
So we have to give... If we're going to do blue-green, then we have to give... We have a domain name anyway, so we're going to as well give that quote unquote beautiful thing to...

**Speaker 2 | 09:23**
In. I did your work. Well.

**lance.fallon@llsa.com | 09:25**
How old? [Laughter].

**Wesley Donaldson | 09:34**
Okay, so we need that. All right, that's fine, we'll get that. Anything else from recurly to us again, like I'm still not there. Maybe this is like just standard how we set up our API gateways. Is there any like is there any security between like we do we're doing the verification of the header verification.
So is that enough? Is there anything else that we need here?

**Speaker 5 | 10:04**
I think we have everything we need.

**Speaker 2 | 10:06**
Maybe great... Just thinking of the worst case if somebody starts hitting our gateway with massive amounts of requests.

**Wesley Donaldson | 10:14**
I mean, that should be policy on the gateway, like denial of service type attacks. That should be policy stuff on Thraling, should be policy stuff on the gateway.

**Speaker 2 | 10:24**
Yeah, I just don't know if we have to add it there.

**Wesley Donaldson | 10:27**
Okay, that's a question. Let's. Let's. We'll ask the question concerned. Can't. Security.
Okay, sweet. All right, we got that move on.

**lance.fallon@llsa.com | 10:45**
I don't know where this will go, but I haven't seen the production but early instance yet. So there will be some release steps. So things like setting up the web and then configuring the secret that gets generated in our instances and things like that we can't do yet, but I don't know if you need to keep track of release steps.

**Wesley Donaldson | 11:12**
There is a ticket that Francis was working on for setting up the environments. Was it 60? I don't think we have some of that already. It's 52, Francis, where are you? 51?
No, his stuff is only on the Azure side. So we don't have anything on that for AWS. Sorry, Lance, can you say that to me one more time, please?

**lance.fallon@llsa.com | 11:58**
I'm just off the top of my head. We'll have to generate create the webhooks and configure them inside of... We'll have to take the secret that gets generated for the webhook and add that to our secrets manager inside of AWS.

**Wesley Donaldson | 12:18**
Okay, so that's here like we... This was actually green. This is not green, this is actually still being worked on. What we're missing here is we're missing the configuration config for production example secret.

**lance.fallon@llsa.com | 12:33**
Core production.

**Wesley Donaldson | 12:57**
Okay, that's good. That was a miss, so we got that. We'll get it on the board. All right, so we're here now. Anyone else, anything else that we're missing from... Recurly to us, what about from customer to Recurly? Nothing really. Once we get the production configuration working, we have the domain name for booking that lifeline scening that will hit that all effectively. Get them to us.
Yeah, I don't think there's anything anyone can think of. Anything between customer and to Recurly other than the configuration of the production environment.
Let's call him and see if we can get through one more area. So we have... Thank you, Lance. Awesome that we have this. So we now have webhooks running. I think my only concern here is that the business has been very clear around observability.
So we have the D LQ, the Jiffcode is part of the CDK. Did you create a dashboard or alerts specific for the Dall-E or is that an outstanding task?

**Speaker 2 | 14:04**
I think it's great and it's routing to teams.

**Wesley Donaldson | 14:05**
It is okay, perfect. The normal channel or something. "Like, maybe we should set up a different channel for recurring."
That's a question for someone else. That's a question for somebodies. So let's ask the question notification same teams... Question. Okay, in the Antonio and the testing that we're doing, what do we need to do to actually trigger this? Is it just us, like breaking putting a wrong URL or something? Actually, I would just sit there. How do we get in your planned test script? How do we get from SQ to DLQ from a script perspective?

**Speaker 5 | 15:01**
My intention is to use BL right to push some orders to recurring sandbox and see the data flowing for real on... Okay.

**Wesley Donaldson | 15:16**
Yeah, I'm aligned with that, I think. My challenge is how do we get something through here to prove this connection works like this? This is clear to me, and I see how we're going to get here. I don't see how we're going to get here without manual intervention. I like the idea of a way for us to be able to trigger this automatically.

**Speaker 5 | 15:36**
On this SK we part probably by breaking the contract and somehow I don't know how because we are consuming a very consistent contract coming from... So in any way, if the webhook is produced, we're going to be able to ingest that one. There is no payload validation if... I'm mistaken on this specific component to justify the... Letter Q. Let me see. I was thinking something... I don't have on top of my...

**Wesley Donaldson | 16:15**
Yeah, don't forget it.

**Speaker 5 | 16:16**
Yeah, top of my head.

**Wesley Donaldson | 16:17**
We'll put it on the list of things I need to work through. I want to give you guys the time back.
I know they're still working through stuff, so here... Anything outstanding? Let's not go in detail as we do over here, but just... We'll do this tomorrow. Maybe anything major outstanding here, like everyone's tucked in on something. We have support from the environment perspective. Who is this like Jeremy confirming? You're tackling this, right? The actual connector.

**jeremy.campeau@llsa.com | 16:48**
No, I didn't know that was a part of the scope for my work right now. I'm working on the e-com three. I'm working through that. Then I thought I was picking up the part where the Lambda would send the whatever the hydrated ACL payload is to the event grid doing that.

**Wesley Donaldson | 17:06**
' happening here.

**lance.fallon@llsa.com | 17:13**
That is the connector Lambda.

**Speaker 5 | 17:15**
Yeah. I wasn't under the same impression. Yeah, the connector is pretty much the same LLaMA that will make the mapping and send to CSTAR.

**Wesley Donaldson | 17:23**
Yeah, so the both the tickets are on you. Sorry, go ahead.

**lance.fallon@llsa.com | 17:26**
But I think Jeremy's doing the mapping in CSTAR now or in e-com now, but the connector Lambda is still going to send to the event. I think Jeremy was saying he was aware of that.

**Wesley Donaldson | 17:37**
I thought these two were the same tasks. These two were the same Lambda or the same... My God. I thought these two were the same Lambda and the same stream of work.

**lance.fallon@llsa.com | 17:44**
Yes.

**Wesley Donaldson | 17:49**
This is so pushing. This be responsible for pushing on the event grid.
Then, Jeremy, you're absolutely right. You're taking this. So, FRCIS should have set up the grid for you, but you're taking this like Lance. I thought you were helped. You're pairing with Francis to get the grid configured and set up, but I'm not sure why, but something he should be able to do himself. Just give that to Jeremy.
This effort here... I did think Germany that you had that as well.

**jeremy.campeau@llsa.com | 18:22**
I mean, if there's someone. I can certainly get to it at some point, but if there's someone else who can get to it first, you know, by all means, give it away.

**Wesley Donaldson | 18:28**
Yeah.

**jeremy.campeau@llsa.com | 18:32**
I mean, we have... So for pushing the events to the event grid, we do the same thing with Shopify.
So it's pretty straightforward, and there's already an example there as far as that stuff goes.

**Wesley Donaldson | 18:39**
Hey.

**jeremy.campeau@llsa.com | 18:41**
We already... We should already have the data as we need it because Antonio already did the work in hydrating and a CL so I think anyone can pick it up.

**Wesley Donaldson | 18:51**
Yeah, okay.

**jeremy.campeau@llsa.com | 18:51**
Really, it's... I don't think it requires a ton of knowledge specific to either thing.

**lance.fallon@llsa.com | 18:59**
Since Jeremy's doing the mapping and you come now that LLaMA to handler is literally just going to take the event, take the body, and send it to the event.

**Wesley Donaldson | 19:09**
Exactly.

**Speaker 5 | 19:10**
Yeah, pretty much like a translation. Simple translation in my opinion.

**Wesley Donaldson | 19:15**
I think this is... You, Rinor, you have the customer service thing on your plate. You have...

**lance.fallon@llsa.com | 19:27**
You become API... Well, that's... I need to get with the FS on the last part of that one side.

**Wesley Donaldson | 19:37**
So this is just the pipeline stuff like and correct me if I'm wrong like is this you're building like the build a CC ICDI script to actually build, to build API like help me with specifically like my thinking what this was just like basic infrastructure work. Is that not what it is?

**lance.fallon@llsa.com | 19:56**
So we already have pipelines and releases set up for e-com to e-com.

**Wesley Donaldson | 20:00**
Okay.

**lance.fallon@llsa.com | 20:01**
It's basically just a matter of... It was cloning the repo, making clones of those pipelines and releases, and making sure they point to the right stuff.
Then the last part of that is making sure that it deploys correctly and if we need to update any domains and apply any certificates.

**Wesley Donaldson | 20:23**
Perfect, all right, okay, that makes sense to me. All right, so that is in good standing, that's still this bad boy here.
I think you're like Antonio. Maybe this is more important. If Lance doesn't have bandwidth, but Lance... I think you'd probably be the best person to grab this. Do you disagree? Is it reasonable?

**Yoelvis | 20:40**
Yeah.

**Speaker 5 | 20:42**
No, that makes sense. Yes, I can take this one. If I have any questions, I can reach out to him. But as long as we have ShopFire as an example, I can make that happen.

**Wesley Donaldson | 20:52**
Well, no, so sorry, I'm asking a question.

**lance.fallon@llsa.com | 20:53**
Yeah, I should be able to get it off.

**Wesley Donaldson | 20:57**
I'm asking Lance, do you think you have bandwidth to take that on with the expectation that we would be targeting really Tuesday for that? Antonio has bandwidth.
If you think your head's down on these two tickets, let's give it to Antonio. Otherwise, I think you have the domain expertise. Where Antonio is going to... I'm sure he'll figure it out. But you have the existing domain experience, you take it, okay?

**lance.fallon@llsa.com | 21:21**
And again, just to reiterate that we won't be doing any translation or mapping in that land, so it's just a straight... What do I get?

**Wesley Donaldson | 21:27**
Yep, it's just passed through exactly.

**lance.fallon@llsa.com | 21:31**
I'm gonna send it.

**Wesley Donaldson | 21:32**
Antonio, that's what I understood as well, like straight passo like it's like glorified cope and paste job.

**Speaker 5 | 21:42**
I was under... Yeah, maybe I'm confused.

**lance.fallon@llsa.com | 21:45**
The germ... There was... This is new, but Jeremy's doing the mapping inside of the... API now.

**Speaker 5 | 21:53**
Yeah, but EU Grid is not expecting a specific event schema like the actual DTO we were talking about.

**lance.fallon@llsa.com | 22:03**
That is a good question, Jeremy. I'm under the impression we can send whatever we would like.

**jeremy.campeau@llsa.com | 22:10**
Yeah, I don't think of ant Grid cares. I don't remember any of that having to be set up when we made it. And on. And then the API that's getting the shop fires it. It takes the JSON body and parses it into like a class or something.
So it that makes me. I think even less that the event grid cares what it gets. I think if like forever ends up working on it. There is like a pattern where you just passed, like the blob of data and event name or something and then maybe something else, but it's there's not really like a specific type of, data you need.

**Speaker 5 | 22:51**
Got it? Got it.

**Wesley Donaldson | 22:52**
Okay, I agree.

**Speaker 5 | 22:53**
The one we'll be doing this specific is the. Is the next work. Right? The econ. Okay, got it.

**Wesley Donaldson | 22:58**
I think my only question here is if we think about hydrating a valid object to pass into Event Grid. Or is it all of the events? Imagine five events are necessary to build a data object at DTO that the e-com API expects. Is any of that happening? Or is it just blindly passing every possible event, and then e-com figures it out?

**Speaker 5 | 23:20**
Is the place to vent the order placed event we have all the information needed to a confluence page, right?

**Wesley Donaldson | 23:26**
So...

**jeremy.campeau@llsa.com | 23:34**
That talks about Antonio, you made the... That's the data. I'm referring to you. I remember. I think it's a chat between me and Wesley where you had sent a document with what is expected in the payload and stuff like that, and was asking questions about it.
That's what needs to be passed, right? Or that's what I'm expecting to be passed.

**Speaker 5 | 23:51**
Yeah. We define that the order placed event is the one that will contain all the information we need to set up the detail. Yeah, it's probably this event that we'll be pushing through Event Grid consuming from the stream.

**Wesley Donaldson | 24:07**
I feel like that's not clear. I feel like we all just said words, but we didn't actually come to clarity. What's here at this point is... I think you're talking, Jeremy, about this document. Maybe one second, technical documentation, and there was something of the other recurring commerce. Are you talking about this guy?

**Speaker 5 | 24:42**
Now a bit. The other place event schema, this one. Yeah.

**jeremy.campeau@llsa.com | 24:48**
Yes, yeah. So right now I'm using that as my guiding light for setting up the stuff in the e-com API.

**Wesley Donaldson | 24:58**
Okay, so this was based of my investigation.
Like, we need to true this up. Like I went through. I think my process made sense, but it could be. It could be wrong. Like, I figured. I looked at the Shopify DTO and I broke it down. Like, all the fields that II was able to identify inside the schema, but like not to. Not to shit myself, but I'd love for someone. I didn't really get a sense that anyone reviewed this.
So if someone has reviewed this, great, you're all good. I would just say maybe just take a moment to verify this order. I mean, I guess we know right away, right? Because the scheme would be wrong when you make it over to the API.

**jeremy.campeau@llsa.com | 25:36**
Yeah.

**Speaker 5 | 25:36**
This document is specifically mine. This page specifically is... I did some research just to make sure that your research was aligned with the DTO and looks like it is.

**Wesley Donaldson | 25:49**
Out here.

**Speaker 5 | 25:50**
So yeah, I did formulate this domain event, and the hydration process is taking this into consideration to decide what data we need to pull from recurring commerce in order to achieve this payload and then be sending this to an Event Grid?

**Wesley Donaldson | 25:53**
Nice.
Perfect. All right, nice. So then, all right, now I feel good. So we have what we need. We're clearing... LAN's going to grab this. This is just a proxy, just passes straight through to a virtual bridge, and that'll give you the order object that you need, Jeremy, to build out the mapping and push it into Krisp nicely.
Okay, anything that we're... Again, open question, anything you feel we're missing that we haven't touched on? We have tickets around getting the Azure environment. We have tickets around getting Event Bridge set up. You're already working on the LLaMA. We agree that we're missing these two, so these are actually not yellow, they're red.
But we know who's going to work on them, so that's fine. Anything else, anything around this year that we feel like we're missing or we don't have transparency into? Oh, sorry, that's a good one. That's my answer. What? There obviously is some equivalent DLQ inside of the Azure environment.
That's a question, not a statement. Like, "Where is that going? Is that being pushed in like a notification into teams if something goes wrong between these two layers?" What's here for backup, for in case something goes wrong?

**jeremy.campeau@llsa.com | 27:25**
I don't know how the event grid is configured. We'd have to ask Francis about what's set up for an event grid for that kind of stuff.

**Wesley Donaldson | 27:39**
Okay, right. The question was on the event grid when we're pulling information for e-com 3 API what infrastructure?

**Jennifer | 27:41**
Sorry. What was the question?

**Wesley Donaldson | 27:50**
What methodology exists for us handling a DLQ, something being dropped, something having an error?

**Jennifer | 28:01**
Okay, so I'm going to answer the same as Jeremy. But they are handling the work that they're doing for the function. We do have them setting up alerting on the Azure side, which does have a process and people are looking at all of that.
So they're setting up alerting on the Azure functions. At the very least, I'm not sure what event grid has, but... It might not be as... I guess. I don't know, but we'll see.

**Wesley Donaldson | 28:39**
That's okay, we'll figure it out.

**Jennifer | 28:40**
All of...

**Wesley Donaldson | 28:41**
Just to understand, that's when you say the function, you're talking about the function that represents the API.

**Speaker 5 | 28:48**
Yes.

**Wesley Donaldson | 28:48**
Okay, cool. All right, we'll trace down that one. Anything on... We got Brian and team to fix the DBATRY for us, so we have what we need there. Anything else that may be a concern on the database side or from the API into the database?
Okay. Just keep that in your mind. Maybe we'll ask the same question next session. All right, let's not go over half an hour. I think this was a great start. We identified some really good stuff. Stay on your tickets, ponder a little bit more, we'll ask the same questions tomorrow, and we'll give you an update status again. Anyone have any lasting to share, thoughts, or worries?

**Speaker 5 | 29:41**
I'm good, thank you.

**Wesley Donaldson | 29:44**
Guys, this was a great session. Thank you so much for attending.
I think this will be very valuable for us going forward. Thank you for the clarity around some of the things missed over here. All right, enjoy the rest of the day.

**Yoelvis | 29:56**
Have a good one. Thank you.

**Wesley Donaldson | 29:57**
Good day.

**Speaker 5 | 29:57**
Guys. Bye.

