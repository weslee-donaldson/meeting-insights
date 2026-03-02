# AppDev - Weekly Demo - Feb, 27

# Transcript
**Speaker 2 | 00:39**
Hey, everyone. People are slowly jumping on. I think today we probably want to start with the demo of the commerce, the storefront. I'm not sure who's going to be doing the first page.

**Wesley Donaldson | 01:06**
7, so our approach here you all this is gonna kind of spin us up, but we are gonna as he kind of Miro ds us through the process. We're gonna give developers a chance to kind of speak to the work that they did.
And. So you I guess if you want to share your screen.

**Speaker 3 | 01:28**
All right, I can do it.
Okay, so what's the plan? I'm going to be driving this. So we are going to let the developers share their screen and speak about what they have done.

**Wesley Donaldson | 02:12**
So we've already shared i think we've kind of already done that like we've given folks a chance to present.

**Speaker 2 | 02:13**
I think it's great to let them.

**Wesley Donaldson | 02:20**
Team members, are you guys ready to just... I think my word here is "let's make sure we're using the actual integrated page, not just your local instance of your specific component?" Nick, do you want to start us off? Gus?
Because you had the navigation changes as well as some stuff on the appointment page.

**Speaker 3 | 02:53**
I think Nick is now here.

**Speaker 2 | 03:00**
Okay, you see his picture, but I don't see him unmuting. Nate, did you want to do the... Can you hear me migration?

**Speaker 3 | 03:15**
Yes.

**Speaker 4 | 03:16**
I'm having internet issues.

**Speaker 2 | 03:24**
Do you want to talk through it while somebody else shares? Sure.

**Speaker 4 | 03:30**
I may drop out, I'm not sure.

**Speaker 3 | 03:34**
Okay, I can sure go ahead, Nick.

**Speaker 4 | 03:46**
I'm not seeing anything.

**Speaker 3 | 04:02**
Can you I see my screen.

**Wesley Donaldson | 04:04**
I can see your screen.

**Speaker 3 | 04:11**
Maybe you can mention Nick what you did, and I can just show it here. Okay.

**Speaker 4 | 04:20**
Let's see. The stepper bar. I did the styling on the stepper bar to match Figma. Updating the dashes, the checkmarks, and I believe the color on it, and then on the appointment page, let's see, I only pull up my local so I can see what I'm... I'm just trying to go about memory.

**Speaker 3 | 04:59**
Yeah, I see the new design is matching the Figma. The PS grade for the stepper abbreviation. Yeah, and you worked on this slide. Now, if you go to the next page and you click on "appointment" or "modify", it's going to preserve everything here on this page. What is great?

**Speaker 4 | 05:23**
Yeah, modify rehydrates the appointment page, and clicking on the appointment breadcrumb or step takes you back to the point page and rehydrates. Then the filtering we did... We do have distance filtering, but we kept the original behavior of falling back to fallback results. In case there's no results, it will still return results outside of the user's selected filter.
So they select 10 miles, but there's something 12 miles. It will show them that result at 12 miles, but it will say these were outside of your location or outside of your filter. But it was...
Yeah. Now?

**Wesley Donaldson | 06:36**
If you use...

**Speaker 4 | 06:36**
Yeah, can you...? I lost it again.

**Wesley Donaldson | 06:36**
Like Canada. Not Canada. Like Alaska or something.

**Speaker 3 | 06:44**
Maybe a location that is not too popular.
We have a screen everywhere. That's good.

**Speaker 4 | 07:06**
Yeah, I had to. I had to make that work locally because we did have screens everywhere, [Laughter].

**Speaker 3 | 07:15**
Even during the weekend, so that's great. Okay.

**Speaker 4 | 07:18**
Now I can see.

**Speaker 3 | 07:22**
Is this like this is real? Okay, yeah, but that's good. I cannot find...

**Wesley Donaldson | 07:31**
And we are not Canada or the United States.

**Speaker 3 | 07:31**
Maybe you say Canada Air Tourn... Do you have an IP CO or something for a location that we don't have a screening in that location?

**Speaker 4 | 08:00**
No, I had to change the MOC server to not return any results for a certain zip code to test that because we had the screenings everywhere.

**Wesley Donaldson | 08:09**
Can you guys hear me?

**Speaker 4 | 08:13**
[Laughter].

**Wesley Donaldson | 08:14**
Can you try Anchorage, Alaska?

**Speaker 3 | 08:21**
They were going to Alaska. Ten miles... If this really... I know this is coming from the previous location.

**Speaker 4 | 08:35**
That says two miles away.

**Speaker 3 | 08:40**
Yeah, but this is the previous location. Don't... It's not a rascal. I don't know, was it this? It might be a spark or something. I don't know.
Let me see.

**Speaker 4 | 09:06**
North Alaska Street, Tampa, Florida.

**Speaker 3 | 09:10**
Okay, you go. Got it. So no screening you can have the indications, but in this one is because they don't even have... In 100 miles. So we are displaying this... Is it? Yeah, so yeah, okay, that's good.
Any questions about this implementation? This appointment page, any concerns?
What happened with the map when I came in? The map disappeared. I don't know... Today while we won...
Okay so we can go to the next step. I think packages and review are on... But... Is doing speaking up? Is someone else working on packages or review?

**Wesley Donaldson | 10:47**
Jifco owns both of these pages, unfortunately. So you all... This I think your work and validation and just putting it together would be the closest person to the page right now.

**Speaker 3 | 11:03**
Let me us get there in this one. So for the package, I think there are still some missing pieces.
Like this thing here, we need to make it look nicer and follow the design. I think we are still working on it. GCO is still working on the distinction for the states that are restricted, like California and those states that we need to do to display less diagnostics.

**Wesley Donaldson | 11:43**
He has three or four PRs open, which should be pushing in some of those features.

**Speaker 3 | 11:43**
Ummm.

**Wesley Donaldson | 11:49**
He's gotten all the feedback he needs from Beth and products.
So we're still tracking to have this completed by the end of the day.

**Speaker 3 | 11:58**
So I'm going to show my local host because I am based on my PR. I just wanted to make sure I did... I showed you the last thing that I'm working on, and it's the checkout page here. Now we are running validations and everything else so we can fill out the form if something is wrong.
It's going to display an error.
Alright, so now this is running the validations and everything. If we are missing something, it's going to highlight that. So we need to select the day of birth. But it has to be... If we select the day there is close to us, it's going to be narrow as well because it's likely to South School. We have to be 25 or older.
We are doing all those validations and then we can complete the purchase for the car. It's doing the validations. In this case, this credit card information here, we don't have access to that information because it's like protected.
We are using recording components. Those components are I frames. It means we don't have access from JavaScript or any way to the values that the user is inputting here. So that's safe enough. Then we can... This is running some validations. The main validation that I is running is about the card number.
If the card number is invalid or is empty, it's going to display those two errors. But then after we complete the purchase, it's going to do the extra validations and extra errors because maybe the transaction failed because the user has not enough funds or things like that.
But this is just a basic validation that Record is doing to make sure that this is a valid number in case it's a valid number. Where Record is returning is like if bad through and the brand, it could be any of those.
The same for the expiration date and the security code. If we put something invalid, it's going to say it's invalid. If we put something like in the past, for example, it's going to say the expiration date is invalid because this is invalid for an expiration date. It should be in the future and things like that. The same for the ease, etc., and the other validation for the billing information. We are validating everything here and here we validate everything.
If we select same billing, it's going to validate those values internally as well because they are required. In case the user has an error, it's going to... If the user is here and hit complete push, it's going to scroll to that particular section. The first section, when we have an error, is going to scroll to that section.
For example, like can... It's going to throw to this section in particular. One thing I did is I tried not to bother the user with a bunch of errors. When the user comes to this page, no error is going to be displayed. The error is going to start displaying after the user starts typing and goes to the next field.
So we are validating this one. Or after the complete purchase button is hit, then we can complete purchases. And yeah, it's working. It's going to this page. We need to wire this page with the response from the previous thing.
But this is what happened and this is against public. So this is what we got is the invoice, the transaction ID, total discount error code, everything else. So it's good and we can go to recording now. This is what Rinor was working on, so Rinor, maybe you can help us understand what happened here.

**Sam Hatoum | 17:29**
Yeah, can you guys hear me? Yeah, I guess without running through the curve. So we did not buy a membership through this one, so there's not going to be a discount applied. But we have the signature screening and the two product add-ons. Both of these are appearing on the same account because it's not a parent-child relationship.
If you go to the invoice, you can see the line items. I just clicked on that link there. So this is where if we did have discounts to apply, whether it was a coupon that they entered themselves or an automatic one that we added because of a membership and a qualifying product, we would see there's discounts here. You would see them on the child or the... Not the... You would see them on the account as well, if they were applied. Swing back to the account, just seeing if there's anything else relevant.

**Speaker 3 | 18:44**
I guess I can. I can create one with the subscription. This one.

**Sam Hatoum | 18:50**
Yeah, you could create a second one and we could share the subscription as well. So I did just something else to... I guess I wasn't sure last night, but the address to the right is showing everything that we enter.
If they enter something into that address field, we are capturing that as well.

**Speaker 3 | 19:19**
And other information we are sending to the backend is like using the token like as you can see here. Let me see if I can. Is the inputin the.

**Sam Hatoum | 19:36**
Not sending a credit card at all?

**Speaker 3 | 19:39**
We are sending this payment token and the payment token is including all information that we need. So this is what we use in recording. We don't have the personal information here or anywhere, so we just use the tone from recording. I can't try the one by doing a membership.
That's something else we need to do. We need to reset the local storage and the session storage when we finish, when the user completely pushes. That's something we are not doing, but we have to do that.
So here I'm going to select the membership. I'm going to select one of these as well. An individual. So we have a lot of stuff here.
Okay, so let me just select this one so you can see how the parent-child relationship is working.
So let's go to account. So we have the parent account and the child account. Can you explain?

**Sam Hatoum | 22:16**
Yes. If you hear the child account, this will have the subscription attached to it, which you can see up top and you can see under the pricing schedule. We have the current one which is in progress. It does start automatically. You scroll up. Just the TED you're able to scroll up soon.
So we have the ramp pricing, which is just something configured inside recursively itself. It's 01:86 now and then 1907, next year. Then this references to the right that it's not billing to this account itself.
So you scroll down just a tad, you can see it builds to the parent. So if you click on demo 2 to go to the parent, this will show the invoice and the charges, just like we saw previously. Then if you click on the invoice, there should be a discount on this one because they got a vitamin D test. Then we replaced the signature package with the one-life membership.

**Speaker 3 | 23:50**
What is this one we have like verification? Okay. This is like record stuff. Right, they do the verification of the process, they do the actual thing. Okay, any questions, concerns? Both.
I'm happy this is looking promising. We have the workflow and we have the recorder integration. There are still a few details to polish, but...

**Speaker 2 | 24:34**
Yeah.
I thank everybody that went through that and that has worked on it. I know it's definitely a group of her and it's looking great getting there. I'm opening it up to some other demos. I know we don't have very many outside of the Commerce line. Harry, were you going to share the stuff that we were talking about?

**Harry | 25:22**
Yeah, I can do that.

**Speaker 2 | 25:24**
Okay, does anybody else have anything after Harry?

**Harry | 25:33**
So this is not going to get technical. My workspace is in the middle of data migration, so I'm going to show you guys diffs. I know we love looking at diffs.
Okay, so to give you a primer, we had an issue that started last week. No, where we introduced a couple of lambs around generating PDFs and then mailing those PDFs. So the third-party vendor for that service is not in place yet, but we want to see the process running and we want to see the logs showing up so that when it looks like it's at parity for what we expect to do, we can switch over when we're ready. The approach was the standard interval approach, right? You get in the basics and you layer on the next piece of the next piece. The gotcha that we found was in part of the first area. The first part of the boilerplate that went in for the PDF generation was the PDF generated event, right?
So the event came in down here. Results PDF generated. So when that went in, participants began getting that event showing up on their street in the case that they actually needed to have a PDF generator, right?
So there are a few business cases for this not particularly relevant. So you end up with a situation where those events are on someone's stream, and when a projector... There are three projectors in the system within various aggregates through the stream and create the projection, they expect everything to conform to these types, right? These types are from the Effect library, and the point of this library... I think Deb would be the expert here. Todoshi is to bring the type safety that we get at build time and extend it to a runtime. Which means that at build time... Yes, we define the structures for our types, we set what they can be, what they can't be, and then wherever they're leveraged, anywhere in the system, we're going to get that type safety at build time, but at runtime we're going to evaluate because we're using this library.
So if something gets a shape that it does not conform to... It's going to throw an error. Then we have Deal CS set up to bump those off. Then that way we can maintain that integrity within our streams.
Then we can get these dead letter queues filled up, and then we can deal with them as needed. That's exactly what happened this time. So the later addition here in our next drop was to introduce new fields to this event, and these are the metadata fields.
Because rather than adding a domain event for every different reason, the business needs to present a PDF or print a PDF we can just have fields and we can add that. So our extension trajectory just becomes this list of reasons, right? This is appropriate. When it came in, they came in as general unions, right?
So you take the different types that can be on there, the different literals you're expecting... All seems good. The issue is that for any stream that has a previous version, one shape of this event will now break because when the projector constructs the projection, it is going to come across a shape of an event that is not the shape it's expecting.
Because these two new fields are here and they're required. Those events will then go into a separate queue and say, "Hey, something's wrong with our data. Go deal with this." So the system did, in fact, behave appropriately.
But there was a further issue, which was that the specific projectors were set to throw an error if they witnessed an event they did not recognize. So this makes sense from a development standpoint when you are building a system and you want to see what your projectors are getting versus what they're dealing with.
So it makes sense from that development period. At a production period, it ceases to make sense. So the fix was... We followed the pattern, we added them, but ultimately any projector should just return the state by default. It shouldn't go and say, "Hey, I don't recognize this."
If it doesn't know about it, it doesn't care. It's the beauty of projections. They're just a projection of the state that you care about. So there are a couple of lessons here. One, projectors in production have to default to just return the state when they're applying state and building it up in their introduction process or projection process.
Anytime an event is added to the system, that event probably should not be edited, but if it is, any additional property should be marked as optional. So we're... There's some discussion about how to address this in the future because technically, the system did work appropriately.
I think it took us a little bit too long to catch it, but we did get the runtime type safety in this case. It was not what we wanted to happen. But in the future, having that type safety is, I think, pretty valuable.
So that's the technical... As short as I could put it. Anybody have any questions, comments, thoughts, or considerations of the fund that is an event source system?
Sam, did I roughly do that?

**Sam Hatoum | 31:39**
JUSTICEFECT I mean a couple of things. First of all, well done for going through the motions and learning some of these lessons to hardware, but some of them really shouldn't have been lessons at all, like the exceptions being thrown. Not good. Shouldn't have been in production.
The other one, the comment that I have previously was this effect library, which is the same as Zod. It's good to have it, but it's got to have smart defaults. Right now, the default throws you into the pit of spikes rather than the pit of success.
Your default general should get you in the pit of success like it should not in an event world like in every other state world. You want it to be strict. That's why you're putting it in the first place, right?
But now we're going to say it's optional everywhere, which defeats the purpose a little bit. Yeah. So, it's arguable whether we actually need effect in production at all. Now that I think of it and what we're doing.

**Harry | 32:37**
Yeah. So that's this. This is the point that I've reached as well. Type safety at build time. That's why we use TypeScript. Introducing something like effect seems valuable if you need that level of type safety at runtime as well. Right if you want the system to treat malformed objects as exceptional.
So yeah, it's a decision we have to make.

**Stace | 33:03**
Yeah. Sam, feel free to go into this or elaborate more correctly than I'm probably about to phrase it. Although this is the pattern for results. Today, we're taking a slightly different approach to projections and these types of events going forward.
So they'll be going to be... This is obviously... We'll have to deal with this at the moment for any changes to the resulting mechanisms. But starting with Commerce will be introducing a new pattern, and that will be the way going forward.

**Harry | 33:36**
Correct? Yeah, exactly.

**Sam Hatoum | 33:38**
I mean, we're using them. Antonio's putting it together out of speak. But we're going to use ET, which is a nice framework that makes all of this structured and makes everybody repeat the same patterns.
That's what they think about frameworks anyway. Yeah. So it will be solved. That it is temporary. I'm happy to show the patterns and walk through them if you think that's useful. Stays for the whole group.

**Harry | 34:03**
I think the key point of it, beyond just the Emmett thing is that, you know, rather than having projections that read from a stream on the fly. Like a just in time sort of projection to rather swap to reading from a read database that has what? That was created a single projection at a single point in time stored in a database that we then read.

**Stace | 34:25**
Yeah, my suggestion, Sam, and the whole team, is yes, we all need to really get up on speed on this, but maybe the time to present might be you. Next week we are going to start getting orders from Recurly. Those will trigger events that will trigger queries. We're going to store those streams, have an anti-corruption layer project something forward that then can be used to access that data with and thrive in the future as we go forward as well as have the legacy system and the strangler pattern right? Query and order object out and get it into Cstar where things still need to exist in Cstar.
So maybe, Sam, once we've got a rough version of that working, it might be better to go through the patterns and download it in our own code, like in our... With one of our own use cases.

**Sam Hatoum | 35:17**
Yeah. I like that. I like that. Just go through the real world once we get it up and running in the theory. Yeah, that. That makes sense. Yeah.

**Stace | 35:26**
The other thing, since this is kind of a technical demo and I'm plan to kind of start to bring this up a little bit more strongly and or as we look at some of the commerce stories going forward in our Mandolor section next week.
And I was still kind of involved in that as, I'd like to start to revisit or firm up our general SD LC, especially around observability and monitoring, right? There should be a set of default things we do every time we deploy a new LLaMA, every time we add something to the graph, and every time we do a projection.
I'm still a little concerned there's a lot of... There's some confusion, right, about how we're logging, where we're logging, why we're logging, and if we're logging.

**Speaker 4 | 36:13**
Is it...?

**Stace | 36:16**
You know, on what platform are we likelying that type of thing right where I really want to firm that up where that those don't those shouldn't need to be call outs and everything and they shouldn't need to be hindsight after we launch, right there just should be certain things we have in place every time we deploy something.
So that is there. So I think that should be and timing's right to do that as we're moving through commerce, you know, and this week, great demo this week. It's good to see everything functional, you know, now that it's working and we can download it to the board, which was sort of our artificially imposed deadline of working through things the way we did the past two weeks. Now is the time to like harden it, get it right and make it production ready with the rest of the features we need for launch.
But I think and that needs to kind of be a topic that everyone is on the same page on. And if you were to kind of quiz through any engineer that they're like they could answer that right? Here's the observability. I'm putting in place. Here's the monitoring that goes out with every new LLaMA.
Right? Just so it becomes an automatic part of our process. Sounds good.

**Sam Hatoum | 37:32**
Sorry, go ahead, Jennifer.

**Speaker 2 | 37:35**
No, you go ahead.

**Sam Hatoum | 37:38**
I was going to say one thing I found really useful recently is having... I think I mentioned it before like validators' markdowns, which we run as part of an AI process. And so effectively it's a code review, right?
But it's looking specifically for these things on a commit by commit basis. We can do it or we can do it on a PR basis. But I do want to commit. It's a pre-commit hook that runs locally. Then before you commit it does the usual lints, checks, etc.
But then it says if this is in this directory, then run this lint which then says for the infrastructure it can check for observability and other things right there and then remind the developer. So rather than have a checklist later, we build it early into the process and get that feedback right where it belongs.
It's a pretty easy thing to set up, right? It is just a pre-commit hook. It runs a Claude minus lint check for this commit batch with this validator. Rules for infrastructure. If it's in this directory and it says... Then do we have observability, do we have logging? Has this been checked?
We can just give that feedback right away to the user, to the developer.

**Speaker 3 | 38:55**
Yeah, it would be nice to have something like that in the continuous integration level.

**Sam Hatoum | 39:03**
Yeah, I'd be worried about that there. I'll tell you why. Just because it's non-deterministic pricing. So sometimes you can just split your build and run it again, and it works, but locally it's just more about giving me bad information.
So it could stop your commit and give you a warning, and then you can opt to ignore it as a developer because I remember I didn't do that. You just didn't see it. Yeah, if you can make it more mathematical, then it definitely benefits in CSD if it's more like non-deterministic and suggestive, I would keep it as a pre-commit hook.

**Stace | 39:34**
With observability, especially when we get to alerting, I think we have to learn from the current state, right? Is too much not helpful, right? There's so much noise. Then we don't... It doesn't do us any good, right?
So that's why I think I want to make sure this is well thought out. We have an established pattern, right? Is it... Century is a cloud watch, right? Because it can't be everything everywhere all at once.

**Speaker 2 | 40:21**
Thank you, everyone. Great demo today. I hope everyone has a great weekend.

**Wesley Donaldson | 40:30**
Thanks, all.

**Stace | 40:36**
Thanks, have a good weekend.

