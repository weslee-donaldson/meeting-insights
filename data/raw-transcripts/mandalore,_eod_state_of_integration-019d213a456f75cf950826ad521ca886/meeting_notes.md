# Mandalore, EOD State of Integration - Mar, 24

## Action Items
- **Jeremy to double-check event filtering approach and confirm with David how events are being filtered on the queue.**
- **Wesley to message Sam to confirm the consolidated schema direction.** - _Wesley Donaldson_
- **Wesley to write up the schema mapping task/ticket for Jeremy to have ready by tomorrow morning.** - _Wesley Donaldson_
- **Wesley to schedule a meeting with the BI team on Friday to review the proposed schema.** - _Wesley Donaldson_
- **Jeremy to review existing projections and KPIs, map available data to the KPIs, and contribute to a proposed schema.**
- **Lance to share the SQS exchange/topic ARN with Antonio.**
- **Wesley to set up a meeting at 10:30 tomorrow morning with JFFCO and Francis.** - _Wesley Donaldson_
- **Lance to review Jeremy's PR for the Azure repo.**
- **Jeremy to make David aware of the event consumption approach.**


## Key Points
- Two listeners on the event grid raised a potential collision concern — Jeremy's approach filters for specific events without acknowledging others, and DJ's membership-specific listener should follow the same pattern to avoid conflicts. 
- Jeremy was advised to review his filtering logic and align directly with David (DJ) on how each listener handles event consumption, without needing Wesley as a proxy. 
- Antonio's original role in BI-specific projections is now tied to formalizing a consolidated schema, prompted by Sam's input and the need to support both legacy and new Recurly reporting. 
- A key open question is whether the BI team can connect directly to a read model via REST or OVC, or must go through a relational database — current understanding is they connect directly to Aurora RDS. 
- Agreed that a view must be maintained over the existing model to avoid breaking downstream reports, while the new schema serves both legacy and new Recurly needs. 
- Antonio clarified that the three new tables he created for orders, order line items, and memberships were built to support the ACL integration demo, not specific business needs, and can be modified or redirected. 
- Uncertainty remains around whether the new schema should unify data from Recurly, Krisp, and Shopify into a single reporting model or keep Recurly separate — needs confirmation from Sam. 
- Schema design requires combining three inputs: existing projections serving current BI reports, Antonio's demonstration tables, and the KPI requirements already shared by the BI team via Confluence. 
- Antonio flagged that Recurly offers ~15 subscription webhooks but only 5 are currently consumed; additional webhooks could supply KPI data without requiring extra computation, and Jeremy should flag any data gaps. 
- On the ACL side, Antonio confirmed work is still in progress and nothing is ready to move to green; Lance confirmed his item is in progress. 
- Jeremy's PR for event consumption is up for review, with Lance identified as the only team member with access to the Azure repo; Wesley noted David should be kept aware of the approach but doesn't need to formally review. 
- Friday was set as the target for an internal schema proposal meeting with the BI team, with Jeremy tasked to review existing projections and KPIs beforehand. 


## Outline
- **Event Grid Listener Configuration** - Jeremy mentioned concerns about potential conflicts between two event listeners - one for membership-specific events and another for order placement events
Wesley suggested that if Jeremy's code is filtering events and only acknowledging relevant ones, DJ's implementation should follow the same pattern to avoid collisions
Jeremy agreed to double-check his filtering implementation and coordinate directly with David to ensure proper event handling without leaving unwanted events on the queue

- **BI Team Schema Integration Planning** - Wesley explained that Antonio was originally intended to help with BI-specific projections, but this work is now tied to single process implementation and schema formalization
Jeremy will become available soon to start working on projections to understand the new pattern and begin schema discussions
Wesley questioned whether the BI team can create direct connections to pull data into their business intelligence tools or if they need to go through a relational database

- **Database Connection Requirements for BI Team** - Antonio expressed uncertainty about the proposed DuckDB with secondary index solution that Sam suggested for BI team queries
Wesley raised concerns about the BI team's skill set and workflow compatibility, questioning what type of connector they would need and how they would ingest data into their tools
Antonio confirmed that the BI team currently connects directly to the relational database, which Wesley agreed was the simpler approach

- **Schema Development Task Assignment** - Wesley proposed that Jeremy take ownership of creating a proposed schema that accounts for current models and future support requirements
Antonio clarified that his current models are flexible and were created to support end-to-end integration rather than specific business needs, so they can be modified as needed
Wesley disagreed, noting that current models power existing reports and would require views to avoid breaking downstream dependencies

- **Legacy vs New System Integration** - Wesley identified that existing projections demonstrate BI team access capabilities, while new requirements from Recurly need to be integrated into a bulletproof schema model
Antonio expressed uncertainty about whether the team should fully integrate everything so that orders from different sources (Crisp, Recurly, Shopify) appear in the same reporting projections or create separate ones exclusively for Recurly
Wesley decided to message Sam for clarification on the integration approach

- **KPI Mapping and Schema Creation Timeline** - Wesley outlined a three-part task combining existing projections, demonstration tables for orders and subscriptions, and BI team requirements from a Confluence page into one unified schema
Jeremy will have two days to complete the mapping activity and propose a schema, with a Friday meeting scheduled to review it with the BI team
Antonio suggested that Jeremy should consider additional available webhooks if he struggles to find data in current projections to fulfill KPI requirements

- **Additional Webhook Integration Consideration** - Antonio mentioned that while they currently consume five webhooks per subscription, Recurly offers about fifteen total webhooks with additional membership information
Wesley agreed this should be escalated to the larger team with states involvement to consume additional webhooks for BI support
Antonio advised Jeremy to keep this option in mind when mapping data requirements for the KPIs

- **Project Status Review** - Wesley aimed for at least one green status per day but acknowledged they couldn't move items to green without Francis and JFFCO present
Antonio reported that ACL work remains in progress with ongoing testing
Lance confirmed his work is in progress, and Jeremy reported his work is in review with a PR submitted

- **Code Review and Coordination Requirements** - Jeremy identified Lance as the only team member with access to the Azure repository for PR reviews
Wesley advised Jeremy to ensure David is aware of his event consumption approach even though David doesn't need to provide the review
Antonio requested that Lance share the exchange or topic information (SQS/ARN) once available for integration purposes

- **Next Steps** - Wesley will create a smaller meeting for tomorrow morning to tackle schema development with a targeted group
Jeremy will receive an initial ticket to examine existing projections and review KPI requirements before the internal meeting
A Friday meeting with the BI team will be scheduled to review the proposed schema, with Wesley aiming to determine what can be presented at that session
The team will coordinate on additional webhook consumption requirements and ensure proper event grid configuration to avoid listener conflicts



