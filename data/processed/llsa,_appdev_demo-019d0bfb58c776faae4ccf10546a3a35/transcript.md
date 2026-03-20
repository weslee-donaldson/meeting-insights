# LLSA, AppDev Demo - Mar, 20

# Transcript
**Jennifer | 00:12**
Good morning, everyone. Afternoon. I guess most of you... I think we were going to see... I'm trying to see if rest is up here. Yeah, West, you're on. Okay. We were going to see if Mandalore could start today with the recurring demos.
Maybe start with recurring... And then we can move on to any of the alerting and stuff after that.

**Wesley Donaldson | 00:43**
Sounds good. We had two things I wanted to cover for Curly. I'm just in the order of the workflow. Antonio, if you want to start... Sorry, Antonio. Lance, if you want to start with just the webhook, and then, Antonio, if you could be on deck for tackling just the hydration,
and then you can speak to the end-to-end testing that you're working on. Sovas, your first...

**lance.fallon@llsa.com | 01:12**
The big ask... Semi scream, yep. So I submitted an order in our e-comm sandbox about fifteen minutes ago. So I wasn't going to go through the order flow. Just the idea being that we do have an order inside of recurring that only triggers a webhook that we will handle.
So I guess just before I dive into that, though, some of the things that we have set up at the moment... Do the webhooks themselves. So we have this guy here which is configured to handle the hand-friendly events that will fire out.

**Wesley Donaldson | 02:08**
That...

**lance.fallon@llsa.com | 02:14**
This includes the charge invoice paid, which we'll see.
Then, since I did get a subscription, we'll get a subscription event. The one thing that calls out with this is the webhook itself. Each of them has a unique key, and this is used to encrypt the header that we get for each of these requests.
So that's why we're giving the authentication on the Thrive side. So we get this webhook comes in, and we check the HMAC and validate the date, and then use this secret key that we have stored in our secrets manager to just validate that the webhook is valid, not someone trying to hack us. The order that I just submitted this guy...
So this was in voice 1233. Swing over to AWS now. So Jira set a lot of this up with the CDK set up. We do have a new API gateway, a Web endpoint, and no authentication sitting in front of it. This all happens in the Lambda handler where we immediately check that it's a valid Web request.
So this is the Web endpoint itself. I'm jumping ahead now. This is the logs of the Web. So this guy... It was accepted about twenty minutes ago or so. So we just log out the Web endpoint itself, which is very slim. We're not hydrating at this stage. I should be there probably. We had a log saying that whether it is a signature valid on queuing Web endpoint.
So again, assuming that everything passes the check, we will have sent this to a queue for something else to actually process this Web endpoint that's not valid. We'll log that out and then inject it. She sighed.
I'll just have to take my word for it. This was seven before this guy came in. It's now eight. We don't have anything yet hooked up to this queue and processing, so there are still messages available on it, but it is queuing up at the moment and the Web endpoint is available to be processed downstream honestly through that.
But if there are any questions...

**Jennifer | 06:07**
Awesome. Thank you so much. Just who do we have next?

**Wesley Donaldson | 06:20**
We're going to do... Antonio. Next. Antonio. This is the hydration in the ACL layer.

**Antônio Falcão Jr | 06:28**
Yeah, let me... Related to hydration, we are through the specific SQS handler for the... Linda. We will be able to consume the key and perform the translation. The idea is to... Based on the event payload on the Web hook payload interact via... SDK and make the translation, by enriching that Web hook with the residual data that we're going to request to the API.
So once. Once we have this hydrated payload, we will be able to pass that through our state management that will evolve this specific state and persist that in our event store. For that, we have these translations mapped. That will make this translation between the webhooks to our bridge domain events, drive-specific ones for membership, orders, and overdue, alongside with these hydration services that we'll use recursively SDK to ask information from Recurr about that specific one.
Once we have that in place, or once we have the domain event in the store, the LLaMA will be able to react for that orla the event and build the C star DTO from that one. Right? So I have created an anti-pattern pipeline that will use the Recurrly SDK, interact via the sandbox, and create some purchases for us to be able to see the full flow.
So I made these to pipeline manual so we can run it manually whatever we want to see it's going on. I just need to get with the team now the proper URL to put in the configuration file. Then we are able to run this. Any specific questions?

**Wesley Donaldson | 09:34**
Do you want to talk about how the end-to-end works? You mentioned the Recurrly SDK. Do you want to talk about what's how we were able to trigger specific types of events or specific types of downstream impacts?

**Antônio Falcão Jr | 09:47**
I don't get a question. Sorry. Blushing.

**Wesley Donaldson | 09:50**
Can you speak to how we would test specific types of events or scenarios within the end-to-end test?

**Antônio Falcão Jr | 09:58**
Okay, yeah, we don't have many scenarios. The end-to-end test now is more focused on covering the full integration, but alongside, I have been working on some different scenarios that I intend to cover potential failures in that path.
That's a work in progress, but for now, this first version of the end-to-end test will cover the happy path. We can say that you will see events getting into the event grid.

**Wesley Donaldson | 10:36**
Thank you. I think that's the critical thing that is relative to Recury. We can touch on... We can keep going.
But I think those are the two critical things I wanted to make sure we covered off relative to Recury. Okay, all right, let's keep going. We... The original order. I think Jennifer... Maybe you want to hold until last and then maybe you all this you up next. Meha, if you could be on deck for walking us through the PR changes as well as... Sorry, the PR deploy changes as well as how we're cleaning up some of the PR environments generally.

**Yoelvis | 11:34**
I can go. This is very straightforward.
So the problem I'm trying to solve here is that GitHub actions are pricey and are kind of slow. In this case, I am testing. This platform is a platform I have used before as well, and I've been getting very good results. It is a drop-in replacement for the GitHub runners, so the only change we need to make is just changing the runs on... To the latest.
For example, that is a GitHub runner. We can't replace that by a Blockchain runner and doing that. They say that the hardware is faster, the cache is faster, and the pricing is better in general. At least 50%.
So in order to try that, you can go to Blockchain. If you want to see what's going on with everything we are running and everything like that, you can go here, and you will see everything. In order to sign in here, you use your GitHub account.
If your GitHub account is associated with the organization, it's going to give you access to the organization. Blockchain stuff here. So here you can see logs, a lot of information that is useful in addition to saving some money. I'm going to show you how this works.
The code changes I made were super simple. I did some other extra changes in this PR because I wanted to upgrade some of the actions to use the latest version because Node 20 is getting deprecated, and we have already migrated to Node 24, so I'm upgrading the actions to the latest version that is using Node 24 as well.
But the relevant changes are these. It's just changing from "latest" to "latest" to this guy here. That's pretty much it. The other thing is that we need to configure the billing after we configure the payment information. We are good to go. I can merge this.
It's going to be no changes for the developers or anything like that. We just need to make sure we use the Black Magic instances instead of the GitHub ones. Here you can see in the deployment that he's just doing exactly the same thing. Sometimes the first deployment is usually very slow, but that's not on the runner itself; it's on AWS because AWS is deployed. There is nothing we can do about that, but then the next deployments are going to be faster as usual. Those are taken. I don't know. Ten minutes, nine to 13 minutes, 14 minutes.
So the time is... No, actually we are not saving a lot of time, especially because we have a lot of steps, one depends on each other, and the CDK deploy. But, we would be saving money.
Hopefully, they promise the CPU and everything is going to be faster. So that's pretty much it.

**Wesley Donaldson | 16:08**
Excellent.

**Yoelvis | 16:08**
Any questions are good, thank you.

**Wesley Donaldson | 16:12**
Nice. All right. Maybe start with the purge and the cleanup task that we have completed, and then we can do the deploy or how we're changing how PR environments get deployed.

**Michal Kawka | 16:24**
Sure thing. Yeah, let me share my screen. It's not completed yet. The implementation was done, but it looks like it's still too slow because our current store DB is very large on... We recently exceeded 32GB, and it looks like I need to find a more clever approach to do that. Ideally, this would work because we would only have a few streams on that environment, but currently, we have so many of them because we've never cleaned them up.
So the idea is that we are adding a new step to the destroy job which will clean up the streams which were provisioned for this particular PR environment. So as you might know, we reuse events store DB across all PR branches and our dev environments, so we don't provision a new event store DB for every PR.
We create fresh streams with prefixes which are generated from the branch name. So in that case, that was topic... And the 7052. The idea is that on the... When we destroy the environment, we need to clean up the streams that we created to avoid issues in the future where our dev instance of the current store DB runs out of disk storage.
So I already implemented that. The idea is simple. We just try to find all streams with that prefix, but since there are so many of them, which basically piled up over the last month, my job timed out. So like I said, I need to find a more clever approach to do that.
But the idea is the same. We need a full cleanup of the PR environment because it's just a waste of resources, disk storage, and compute. So that's the core idea of this particular step, which apparently still needs to be improved. The PR is still a draft, but I wanted to show you and highlight that we are working on that to avoid those issues in the future where our current store DB runs out of disk storage.
If there are no questions to this particular task, I have one more thing that can be presented partially. So I have a PR open which adds a manual trigger to the pipeline for the ephemeral environment.
So currently, for every PR that we create, we provision a PR environment. So we deployed all the lands, created the event streams in the events store DB, and there's no way to decide if you want to provision the infrastructure or not.
On some occasions, it can be a waste of resources because we are, for example, only modifying a rhythm or documentation or whatever, and we explicitly don't want to provision infrastructure for that because we are paying for the resources we are not using. We're wasting GitHub minutes.
So to solve that problem, we added a deployment gate to the deploy job which will only deploy the PR environment if a developer comments on the PR using the slash deploy command. This will basically create a label on the PR which is here, and it's supposed to be called "deploy".
Then GitHub will provision the infrastructure on demand. So as long as the label is on the PR, the infrastructure will be provisioned. For example, you open the PR, you ask for the PR environment.
If you push again, the infrastructure will be provisioned. You don't need to comment every single time to deploy. In order to deploy, if you remove the label from your PR, there won't be a redeployment.
So that's basically a switch that you can use on the PR using a label to either enable your PR environment or not. Of course, even if you remove the label and destroy the PR environment, the infrastructure will be deleted.
So that destroy job doesn't take that into account; it will always delete the PR environment if there was any created. So that's the core idea. Pretty simple task, but I hope it will save us all those resources GitHub minutes that we usually don't need.
Because, for example, for this particular task, I didn't need any infrastructure; I only needed to change the workflows. So if we change the workflow, we don't need to put infrastructure. If we change read mes or documentation, we don't need to do that.
So that gives us more control over the deployment process, and I hope it will be useful.

**Jennifer | 21:19**
I definitely think it will be. This is great.

**Michal Kawka | 21:28**
That's it for my side.

**Jennifer | 21:29**
I like your own label idea, it makes it easy.

**Yoelvis | 21:37**
Yeah, it's great. What I don't understand is the dash deploy. Is that required, or can we not just use the label?

**Michal Kawka | 21:48**
I cannot test that yet because it's not merged to main, and that's how the GitHub workflow actually works. So I can definitely answer that question after we merge that. But I hope and I'm 90% sure that the label only will work.
If you comment/deploy, if you post the comment, it will add a label for you.

**Yoelvis | 22:09**
So that's in addition to the label.

**Michal Kawka | 22:11**
Correct. Yeah.

**Jennifer | 22:13**
Is that you can do it from like IDES or CL yeah.

**Michal Kawka | 22:18**
Correct. If you're a CI guy, just at recommend. If you want to put a label, just put a label.

**Yoelvis | 22:22**
So can you try that and add the label to see what happens?

**Michal Kawka | 22:30**
Yeah, if it will work. I'm afraid it won't work because it's not married to me yet.

**Yoelvis | 22:37**
I think it will work. Let's

**Speaker 7 | 22:38**
See. Yeah.

**Michal Kawka | 22:41**
It actually does. So the deployment gate is being checked. Thank you for the hint.

**Yoelvis | 22:55**
Are you DESTROYING the environment if we remove the label, or is it still happening when we close the merged PR?

**Michal Kawka | 23:10**
When we merged the PR, the destroy is only triggered when we close the PR or merge the PR to the main branch. And if that's still required, we can easily do that, but I think it's better to basically do that only when we destroy the KR or merge.
Okay, so it looks like it's working. Thank you so much for taking the time to go over all this. So it's preparing the deployment. Yeah, then it would go ahead and deploy all the Lambdas that we have the infrastructure
for. So that's how it works. You can either use the slash deploy command or the label on the PR.

**Wesley Donaldson | 23:58**
Right? I think that's everything from Mandalor. Jennifer, your abs are on AI usage. Whenever you're ready or whenever you want to...

**Michal Kawka | 24:07**
Yeah.

**Jennifer | 24:07**
I'll do that near the end if I let Endor go first.

**harry.dennen@llsa.com | 24:16**
I think Ferman has Theron and facing changes that were made this week. Then Dan's got a stability improvement.

**Speaker 7 | 24:25**
Yeah, I can go first because it's pretty quick. I did have two boxes, and the task that was created or was done in front-end. I'll share my screen. Okay, yep, so I have my... But then for the task, or one of the tasks is removing the yellow banner on the front-end.
So if I plug into the front-end... Sorry, I'll lock out. So yeah, here you can see that the yellow banner is gone. One of the bug fixes we have is for this test, which Google... Who's specifically Google's test? The test not performed is being shown if the range is critical low or less than 91. Something like this one.
So we... I found out that the label was there for the header, so I just removed it for critical low cases. So... Google
search for... So here, whenever it's in critical low or less than 40 or less than... So the test not performed is removed. So we're good with that one, and then another front-end change or fix was having the incidental found. Specifically the waves. This shield has a queue in front of it, so it appears in three different places.
I think this is the summary page. Then two of them were the detailed page. So here and here in the paragraph, we see that waves here are the correct wordings. So if we go back here and then I'll go back to the summary page first, here for atrial fibrillation, E waves are corrected here.
Then if we go to view details, here. So few waves here. Lastly, the paragraph for the K waves here. This is the portal front. Well, the fix for the summary page is the report carried over for the admin portal side, so if file copy... If I look at the adding portal...
Sorry, I need to add the... What? It was the authorization for our...
Again.
So here the atrial fibrillation one for the Q waves appears. Then if we go to the detailed report material atrial fibrillation here, Q waves here, and then the other one is here. Then for the Google change, the label for tests not performed is removed, and that's it.
So any questions on the changes?

**Jennifer | 30:10**
A lot of little things fixed. Awesome.

**Speaker 7 | 30:20**
I'll stop sharing that.

**Speaker 9 | 30:27**
All right, I'll go next. Can everybody see the screen? Sweet. So as part of the stability upgrades, or changes that are made, they are already synced into main. This is the relevant PR request I can drop and chat once I'm done here.
Then what? I'm just going to go through is effectively just a couple of different examples of areas where I've implemented these changes. The overarching goal here is effectively to replace places where our connector handlers, our event command handlers, and our aggregators are throwing errors on unrecognized types. This is a piece of work that was effectively found and worked through with some of the most recent issues that we had in production not too long ago, one of which was involving when we introduced event shapes that were not flexible enough right to be recognized.
So at run time, effectively you would fall through either FL cases or switch cases right into these bottom defaults where we would then throw errors, and then that would then have some disastrous effects for the downstream processing of some of these events. Or effectively applying events to streams.
So to give you guys an idea of what that looks like, you'll start to see a couple of very similar patterns. Austrian code. One of the cases is when we do have in our connector handlers. This one, for example, is our participant events handler.
This one's using a switch case pattern here for checking the domain event that's coming through in its default case. Previously this was throwing an error. It is now taking the logger that's on its active dependencies and just shooting at a quick log debug log here saying, "Hey, I just received an unrecognized event as part of an exhaustive check. I don't know what it is, so I'm just going to log it out." Here is another handler here. This one is our spot handler. This one is not using a switch case, right?
It's using an if-case and if-else case chain here, and you'll see here at the very bottom of your L case as your default here, just before returning a successful response, we're just going to log that previously. Throw an error and throw in a skipping error organized that. Another area right that I mentioned was in our projectors.
Because effectively when you're creating your projective state, you are applying those events over and over again to build that state up. So this one is our partment projector, and you can see this one is using a switch case statement at the very bottom. Here. When we default for the producer projector, we're now just using a log and just debugging out. "Hey, I got an event that I don't know what it is."
I'm going to give you out the stringified version of it instead of throwing, here is an example of that change for our aggregators. This is a good one to discuss as far as a style of implementation for this one where, effectively this aggregator right on its interface or its implemented interface. The implied event here is called.
However, there is effectively a private version, right? This is the higher-order apply event, and there's a private version inside of it. It is leveraging something called an event handler map right where in an attempt to strongly type-write and compile all the events that should be handled with the states coming through here, we then try and map the event that's coming through to its respective handler. This, of course, allows for the ability that the handler is not found.
So what we do is we throw in some extra guarding logic here to say, "Hey, based on the potential unrecognized event that comes through, if there is no handler here, this is where we're in that era state where we previously would be throwing."
Because it's now a handler that does not map to that respective event that's coming through, we're just going to log this error out and say, "Hey, we didn't find a handler that can handle this event that's coming through, and then return state." Harry, you got your handouts.

**harry.dennen@llsa.com | 35:29**
I just muted myself. So Antonio, this is something that came up as well. Antonio, we saw this as part of the indirection in the aggregate command handler pattern, and the new event pattern effectively gets rid of this going forward because it separates the decisions and the commands. Whereas in this, this is the point at which they are put together.
So you're deciding what commands to run along with actually running them. So it's nice that in the future, this is not a situation we have to deal with.

**Wesley Donaldson | 36:04**
To the boy. The bo.

**Antônio Falcão Jr | 36:09**
That makes sense.

**Speaker 7 | 36:10**
Yeah, well observed, yeah, absolutely.

**Speaker 9 | 36:17**
I will drop that PR in the chat here, and I guess any other questions or comments?

**harry.dennen@llsa.com | 36:28**
It's good, more stability. The last piece, I just want to talk about a couple of bugs that we dealt with this last week or two in particular. One is this speaks to some discussions around the value of an event source system.
So it's important that this is one of the benefits we get. We're just going to share this. There's really not a lot to show here. I'm just going to talk through it. But I'll give you just so you can see what I'm referring to. We have dead letter queues in the system.
So at any point where an event is being processed and that event cannot be processed for whatever reason, we have two options that we run. We either put it into a queue, which we call a dead letter queue, but we're not actually leveraging Amazon's dead letter queues, which are just queues attached to other queues. We just put the event in this queue. We call it a dead letter queue, and then we carry on. The other option is parked events. Now, last week we had two situations that arose. One was there was an issue from Shopify where the payloads they were issuing were malformed in the customer object on the payload it was missing a customer name, which was obviously breaking things.
They would show up in this dead letter queue here. Broad shop 5 legacy web book. I think we had... And we could see this increasing, right? There were multiple issues causing that. One of them was a shopper fight issue. What this allowed us to do, and Nick handled this part, was to augment the malformed events that we had and then rerun them, meaning that we didn't lose any data and we got the correct data in, and we could see exactly what was broken and it was never made it in, right?
So from that integrity perspective, the event helped us. Wesley, what's up?

**Wesley Donaldson | 38:31**
Wrong button. I was just going to give you an event sourcing.

**harry.dennen@llsa.com | 38:34**
Okay. Yeah. So... It allowed us to troubleshoot the other issues that were happening, like why they were in there, right?
It's nice to see that there's a clear, distinct place where broken things can go, and we can address them outside of the normal pattern. The other issue we had was in the results PDF events.
So we saw this one blow up to about 1400 events went into the queue and if you remember, last week we shipped an update to all of our Lambdas to upgrade from an end-of-life version of Node.js to the latest LTS.

**Wesley Donaldson | 38:59**
I...

**harry.dennen@llsa.com | 39:11**
I don't know anyone who's done these kinds of updates, but there's always something that breaks no matter how much you check.
What broke here was that when we create PDFs on Lambdas, we fire up an instance of Chromium. Now that instance of Chromium uses a dependency of some library, and that library was incompatible with the LTS Node. This is the kind of thing that slips to the cracks. That happened on Friday. Over the weekend our queue filled up for all the people who were we were generating PDFs for and it was really a simple matter of updating to the newest Chromium which could run on the latest LTS of Node and then run the script to drain the queue. Problem solved.
So there are just two instances that I want to highlight from this week. That kind of saved us that the event sourcing pursuit gave us a clear way to fix this and troubleshoot without affecting any of the normal production runtime.
That's it. Questions, comments?

**Jennifer | 40:27**
For those examples, I think you were saying, like, those were the DL Qs. I thought that the event sourcing specifically was for like the parked events, whereas like DLQS are in any event driven system, right?

**Wesley Donaldson | 40:39**
[Laughter].

**harry.dennen@llsa.com | 40:46**
Technically, yes.

**Jennifer | 40:49**
Okay, yeah, so, like, but then the parked events, the benefit from them is that it'll go in a certain order, right? I think whereas you can't guarantee that from d LQSM.
Okay, any other questions?
Okay, and then Harry, is that it for your team?

**harry.dennen@llsa.com | 41:25**
Yep, that's it awesome.

**Jennifer | 41:29**
I'm gonna share this, I'm gonna get a link for you guys. So we have... As I scrolled down, we have the new AI access to infrastructure and data policy. Trying to see if Brian's on. But thank you, Brian and team, if you're watching this later, for getting this so quickly.
They put together... Because we wanted to be able to safely use AI to look through logs on AWS and other things to help us troubleshoot and diagnose issues. But we wanted to do it in a way that we could assure ourselves that we're going to be safe and we're going to stay in line with policies and stuff.
So, I'm not going to go through all of this, but basically, this is for connecting something like Claude or GitHub Copilot up to AWS, giving it access to using the CLI. What we're going to have is we're going to have specific service users for each person that is using it for that purpose.
So that service user that IAM role will allow the AI just what it needs. I'll get that resource list in a minute that we're first opening it up to. But that way, we keep the AI focused on logs and not like our S3 buckets or anything with PI.
That's really the big concern. It keeps it away from any of the infrastructure being able to run any commands that it shouldn't run. We shouldn't have admin permissions for AI. I know that in the past, we've done it with Gates, and I think we're just improving it just a little bit.
So going down here, one of the things I wanted to point out is the data classification and handling AI systems. Processing sensitive data must use approved encryption and protection methods. Mechanisms like any of the sensitive data must not be entered into open or unapproved AI systems.
So one of the things... When you're processing a large file or something like that and it's all full of PI, that might not be the best use of AI unless anybody here has a better solution. But for now, that's not necessary.
That's not where we want to be putting... PI does the... Sorry, one second. The resources that we're going to give it access to in AWS is going to be cloud formation read-only, cloud front read-only, and then cloudwatch logs metrics alerts read-only, and those are here.
If we're logging PII and we notice it, we should handle that and mask it or take it out of the logs because we shouldn't be logging PII unless we have that delete me thing on. But that's very short-lived.
So any questions? I'll just send you all to Brian. I can answer some... Okay, just a...

**bethany.duffy@llsa.com | 45:27**
General question. Where do these policy documents live in case...? Thinking of new team members, where we get them when they're coming in.

**Jennifer | 45:39**
I get a whole from Brian. Okay, yeah, I don't know. I will have to find that. But yes, I'm going to put a link on the onboarding. Good point.

**Jivko Ivanov | 46:10**
Hey, just thinking a little bit out here. I understand the policy. I'm just thinking maybe we should add some rules to our Claude files to basically self-censor the I from that use. If you ask it to do something, if it decides to do something, and if there is a hole there, say, "I actually cannot do that." If that makes sense.

**Jennifer | 46:34**
The robot overloads might listen to us. I think that's a great idea. In addition to this, definitely I think you mentioned having... No, he mentioned having something where it was no deletes, no rights, or something to his rules.
So he probably already has that logic to share.

**Jivko Ivanov | 47:08**
Yeah, maybe he could share.

**Jennifer | 47:11**
Okay, that is my... I feel another thing that I had noticed is that it's new, and it's been getting updated and everything, but on the portal, I noticed that Storybook is outdated and doesn't exactly match everything, and there are some broken components.
So just a reminder, as we're working on any component in the front end, we should be making sure that the Storybook doesn't break. Because that's one of the best ways to share with products or designers what it looks like now so that they can make future design improvements that are more similar to what we have without having to chase down users or data or anything like that.
Other than that, I have nothing else. Does anyone else have anything? Okay. Awesome job this week. So much got done. Thank you.

**Speaker 9 | 48:35**
Everyone, see you? Yes.

**Wesley Donaldson | 48:39**
Thanks, all.

**lance.fallon@llsa.com | 48:40**
So thank you. Have a good one.

**Wesley Donaldson | 48:41**
A weekend.

