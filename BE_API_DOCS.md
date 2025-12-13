# Backend API Specifications for Application Form Steps

This document outlines the API endpoints and expected data structures for the "New Application" form wizard. The frontend uses these endpoints to save progress at each step.

**Base URL Structure**: `/applications/{applicationId}/steps/{stepNumber}/{slug}`
**Method**: `PATCH` (unless otherwise noted)
**Content-Type**: `application/json`

---

## Step 1: Personal Details

**Endpoint**: `/applications/{applicationId}/steps/1/personal-details`
**Method**: `PATCH`

### Request Body Schema

| Field                        | Type   | Required | Description/Notes                                          |
| ---------------------------- | ------ | -------- | ---------------------------------------------------------- |
| `student_origin`             | string | **Yes**  |                                                            |
| `title`                      | string | **Yes**  |                                                            |
| `given_name`                 | string | **Yes**  |                                                            |
| `middle_name`                | string | No       |                                                            |
| `family_name`                | string | **Yes**  |                                                            |
| `gender`                     | string | **Yes**  |                                                            |
| `date_of_birth`              | string | **Yes**  |                                                            |
| `email`                      | string | **Yes**  | Valid email format                                         |
| `alternate_email`            | string | No       |                                                            |
| `phone`                      | string | **Yes**  |                                                            |
| `home_phone`                 | string | No       |                                                            |
| `country_of_birth`           | string | **Yes**  |                                                            |
| `nationality`                | string | **Yes**  |                                                            |
| `passport_number`            | string | **Yes**  |                                                            |
| `passport_expiry`            | string | **Yes**  |                                                            |
| `visa_type`                  | string | No       |                                                            |
| `visa_number`                | string | No       |                                                            |
| `visa_expiry`                | string | No       |                                                            |
| `search_address`             | string | No       |                                                            |
| `country`                    | string | **Yes**  |                                                            |
| `building_name`              | string | No       |                                                            |
| `flat_unit`                  | string | No       |                                                            |
| `street_number`              | string | **Yes**  |                                                            |
| `street_name`                | string | **Yes**  |                                                            |
| `suburb`                     | string | **Yes**  |                                                            |
| `state`                      | string | **Yes**  |                                                            |
| `postcode`                   | string | **Yes**  |                                                            |
| `postal_same_as_residential` | string | **Yes**  | "Yes" or "No"                                              |
| `postal_country`             | string | No       | Validation is not enforced in schema, essentially optional |
| `postal_building_name`       | string | No       |                                                            |
| `postal_flat_unit`           | string | No       |                                                            |
| `postal_street_number`       | string | No       | Validation is not enforced in schema, essentially optional |
| `postal_street_name`         | string | No       | Validation is not enforced in schema, essentially optional |
| `postal_suburb`              | string | No       | Validation is not enforced in schema, essentially optional |
| `postal_state`               | string | No       | Validation is not enforced in schema, essentially optional |
| `postal_postcode`            | string | No       | Validation is not enforced in schema, essentially optional |
| `overseas_country`           | string | No       |                                                            |
| `overseas_address`           | string | No       |                                                            |

---

## Step 2: Emergency Contact

**Endpoint**: `/applications/{applicationId}/steps/2/emergency-contact`
**Method**: `PATCH`

### Request Body Schema

The body should contain a `contacts` array.

| Field      | Type  | Required | Description/Notes  |
| ---------- | ----- | -------- | ------------------ |
| `contacts` | Array | **Yes**  | Min 1, Max 3 items |

**Contact Object Structure**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | **Yes** | |
| `relationship` | string | **Yes** | |
| `phone` | string | **Yes** | |
| `email` | string | **Yes** | |
| `address` | string | **Yes** | |
| `is_primary` | boolean| No | |

---

## Step 3: Health Cover

**Endpoint**: `/applications/{applicationId}/steps/3/health-cover`
**Method**: `PATCH`

### Request Body Schema

| Field           | Type   | Required | Description/Notes        |
| --------------- | ------ | -------- | ------------------------ |
| `provider`      | string | **Yes**  |                          |
| `policy_number` | string | **Yes**  |                          |
| `start_date`    | string | **Yes**  |                          |
| `end_date`      | string | **Yes**  | Must be after start_date |
| `coverage_type` | string | **Yes**  |                          |
| `cost`          | number | No       |                          |

---

## Step 4: Language & Cultural

**Endpoint**: `/applications/{applicationId}/steps/4/language-cultural`
**Method**: `PATCH`

### Request Body Schema

| Field                                  | Type          | Required | Description/Notes |
| -------------------------------------- | ------------- | -------- | ----------------- |
| `aboriginal_torres_strait`             | string        | No       |                   |
| `is_english_main_language`             | string        | No       |                   |
| `main_language`                        | string        | No       |                   |
| `english_speaking_proficiency`         | string        | No       |                   |
| `english_instruction_previous_studies` | string        | No       |                   |
| `completed_english_test`               | string        | No       |                   |
| `english_test_type`                    | string        | No       |                   |
| `english_test_date`                    | string        | No       |                   |
| `english_test_listening`               | string        | No       |                   |
| `english_test_writing`                 | string        | No       |                   |
| `english_test_reading`                 | string        | No       |                   |
| `english_test_speaking`                | string        | No       |                   |
| `english_test_overall`                 | string        | No       |                   |
| `first_language`                       | string        | No       | Legacy            |
| `english_proficiency`                  | string        | No       | Legacy            |
| `other_languages`                      | array<string> | No       |                   |
| `indigenous_status`                    | string        | No       | Legacy            |
| `country_of_birth`                     | string        | No       | Legacy            |
| `citizenship_status`                   | string        | No       | Legacy            |
| `visa_type`                            | string        | No       | Legacy            |
| `visa_expiry`                          | string        | No       | Legacy            |
| `english_test_score`                   | string        | No       | Legacy            |

---

## Step 5: Disability Support

**Endpoint**: `/applications/{applicationId}/steps/5/disability-support`
**Method**: `PATCH`

### Request Body Schema

| Field                          | Type    | Required | Description/Notes |
| ------------------------------ | ------- | -------- | ----------------- |
| `has_disability`               | enum    | **Yes**  | "Yes" or "No"     |
| `disability_hearing`           | boolean | No       | Default false     |
| `disability_physical`          | boolean | No       | Default false     |
| `disability_intellectual`      | boolean | No       | Default false     |
| `disability_learning`          | boolean | No       | Default false     |
| `disability_mental_illness`    | boolean | No       | Default false     |
| `disability_acquired_brain`    | boolean | No       | Default false     |
| `disability_vision`            | boolean | No       | Default false     |
| `disability_medical_condition` | boolean | No       | Default false     |
| `disability_other`             | boolean | No       | Default false     |
| `disability_type`              | string  | No       | Legacy            |
| `disability_details`           | string  | No       | Legacy            |
| `support_required`             | string  | No       | Legacy            |
| `has_documentation`            | boolean | No       | Legacy            |
| `documentation_status`         | string  | No       | Legacy            |
| `adjustments_needed`           | any     | No       | Legacy            |

---

## Step 6: Schooling History

**Endpoint**: `/applications/{applicationId}/steps/6/schooling-history`
**Method**: `PATCH`

### Request Body Schema

| Field                   | Type   | Required | Description/Notes |
| ----------------------- | ------ | -------- | ----------------- |
| `highest_school_level`  | string | No       |                   |
| `still_attending`       | enum   | No       | "Yes" or "No"     |
| `secondary_school_type` | string | No       |                   |

---

## Step 7: Qualifications

**Endpoint**: `/applications/{applicationId}/steps/7/qualifications`
**Method**: `PATCH`

### Request Body Schema

| Field                | Type  | Required        | Description/Notes                                     |
| -------------------- | ----- | --------------- | ----------------------------------------------------- |
| `has_qualifications` | enum  | **Yes**         | "Yes" or "No"                                         |
| `qualifications`     | Array | **Conditional** | **Required** if `has_qualifications` is "Yes" (min 1) |

**Qualification Object Structure**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `qualification_name` | string | **Yes** | |
| `institution` | string | **Yes** | |
| `completion_date` | string | **Yes** | |
| `certificate_number` | string | **Yes** | |
| `field_of_study` | string | **Yes** | |
| `grade` | string | **Yes** | |

---

## Step 8: Employment History

**Endpoint**: `/applications/{applicationId}/steps/8/employment-history`
**Method**: `PATCH`

### Request Body Schema

| Field               | Type   | Required | Description/Notes |
| ------------------- | ------ | -------- | ----------------- |
| `employment_status` | string | No       |                   |
| `entries`           | Array  | No       |                   |

**Employment Entry Object Structure**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employer` | string | No | |
| `role` | string | No | |
| `start_date` | string | No | |
| `end_date` | string | No | |
| `is_current` | boolean | No | |
| `responsibilities` | string | No | |
| `industry` | string | No | |

---

## Step 9: USI

**Endpoint**: `/applications/{applicationId}/steps/9/usi`
**Method**: `PATCH`

### Request Body Schema

| Field               | Type    | Required | Description/Notes |
| ------------------- | ------- | -------- | ----------------- |
| `usi`               | string  | **Yes**  | 10 chars          |
| `consent_to_verify` | boolean | **Yes**  | must be true      |

---

## Step 10: Additional Services

**Endpoint**: `/applications/{applicationId}/steps/10/additional-services`
**Method**: `PATCH`

### Request Body Schema

| Field                         | Type  | Required        | Description/Notes                                      |
| ----------------------------- | ----- | --------------- | ------------------------------------------------------ |
| `request_additional_services` | enum  | **Yes**         | "Yes" or "No"                                          |
| `services`                    | Array | **Conditional** | **Required** if `request_additional_services` is "Yes" |

**Service Object Structure**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `service_id` | string | No | |
| `name` | string | No | |
| `description` | string | No | |
| `fee` | number | No | |
| `selected` | boolean | No | |

---

## Step 11: Survey

**Endpoint**: `/applications/{applicationId}/steps/11/survey`
**Method**: `PATCH`

### Request Body Schema

| Field                 | Type   | Required | Description/Notes |
| --------------------- | ------ | -------- | ----------------- |
| `availability_status` | string | **Yes**  |                   |

---

## Step 12: Documents (Read Only / Status)

**Endpoint**: `/applications/{applicationId}/steps/12/documents`
**Method**: `GET`

### Response

Returns the status of updated documents.
_Note: Document upload is handled via a separate process/endpoint not detailed in the step update service._

---

## Additional Endpoints

**Get Survey Availability Codes**
**Endpoint**: `/applications/survey-availability-codes`
**Method**: `GET`
**Response**: Array of `{ code: string, label: string }`
