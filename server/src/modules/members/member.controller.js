/**
 * Module: Member Controller
 * File: member.controller.js
 * Purpose: Handles member create, list, detail, update, and operational readiness responses.
 */

const { buildApiResponse } = require("../../utils/apiResponse");
const {
  createMember,
  getMemberById,
  getMemberList,
  getMemberOperationalProfile,
  updateMember
} = require("./member.service");

/**
 * Returns the member list for the Members module.
 */
const getMemberListHandler = async (request, response, next) => {
  try {
    const data = await getMemberList(request.query);

    response.status(200).json(
      buildApiResponse({
        message: "Member list fetched successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Returns a single member record.
 */
const getMemberByIdHandler = async (request, response, next) => {
  try {
    const data = await getMemberById(request.params.memberId);

    response.status(200).json(
      buildApiResponse({
        message: "Member profile fetched successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Returns the member operational readiness profile.
 */
const getMemberOperationalProfileHandler = async (request, response, next) => {
  try {
    const data = await getMemberOperationalProfile(request.params.memberId);

    response.status(200).json(
      buildApiResponse({
        message: "Member operational profile fetched successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a new member record.
 */
const createMemberHandler = async (request, response, next) => {
  try {
    const data = await createMember(request.body, request.auth);

    response.status(201).json(
      buildApiResponse({
        message: "Member created successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Updates an existing member record.
 */
const updateMemberHandler = async (request, response, next) => {
  try {
    const data = await updateMember(
      request.params.memberId,
      request.body,
      request.auth
    );

    response.status(200).json(
      buildApiResponse({
        message: "Member updated successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMemberListHandler,
  getMemberByIdHandler,
  getMemberOperationalProfileHandler,
  createMemberHandler,
  updateMemberHandler
};
